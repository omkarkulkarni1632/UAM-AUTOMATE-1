import { differenceInDays } from "./dateUtils";
import { UserAccessStatuses } from "../../domain/models/UserAccess";
import { PermissionRepository } from "../../domain/repositories/PermissionRepository";
import { RiskScoreRepository } from "../../domain/repositories/RiskScoreRepository";
import { RoleTemplateRepository } from "../../domain/repositories/RoleTemplateRepository";
import { UserAccessRepository } from "../../domain/repositories/UserAccessRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class RiskEngine {
  constructor(
    private readonly deps: {
      users: UserRepository;
      userAccess: UserAccessRepository;
      permissions: PermissionRepository;
      roleTemplates: RoleTemplateRepository;
      riskScores: RiskScoreRepository;
    }
  ) {}

  async calculateForUser(userId: string) {
    const user = await this.deps.users.findById(userId);
    if (!user) throw new Error("User not found");

    const access = (await this.deps.userAccess.listByUserId(userId)).filter(
      (a) => a.status === UserAccessStatuses.GRANTED
    );

    const permissions = await this.deps.permissions.listByIds(
      access.map((a) => a.permissionId)
    );
    const permById = new Map(permissions.map((p) => [p.id, p]));

    const template = await this.deps.roleTemplates.findByRoleAndDepartment(
      user.role,
      user.departmentId
    );
    const roleDefault = new Set(template?.defaultPermissions ?? []);

    // Peer deviation: simple baseline = fraction of peers (same role) with permission granted.
    const peers = (await this.deps.users.listAll()).filter((u) => u.role === user.role);
    const peerPermissionCounts = new Map<string, number>();
    for (const peer of peers) {
      const peerAccess = (await this.deps.userAccess.listByUserId(peer.id)).filter(
        (a) => a.status === UserAccessStatuses.GRANTED
      );
      for (const a of peerAccess) {
        peerPermissionCounts.set(a.permissionId, (peerPermissionCounts.get(a.permissionId) ?? 0) + 1);
      }
    }
    const peerTotal = Math.max(peers.length, 1);

    let score = 0;
    const factors: Record<string, unknown> = {
      privilege: [],
      dormant: [],
      sensitive: [],
      peerDeviation: [],
      roleMismatch: [],
    };

    const now = new Date();

    for (const a of access) {
      const p = permById.get(a.permissionId);
      if (!p) continue;

      // privilege level risk
      if (p.privilegeLevel >= 4) {
        score += 20;
        (factors.privilege as unknown[]).push({ permissionId: p.id, added: 20, privilegeLevel: p.privilegeLevel });
      } else if (p.privilegeLevel >= 3) {
        score += 10;
        (factors.privilege as unknown[]).push({ permissionId: p.id, added: 10, privilegeLevel: p.privilegeLevel });
      }

      // sensitive system risk
      if (p.isSensitiveSystem) {
        score += 15;
        (factors.sensitive as unknown[]).push({ permissionId: p.id, added: 15, system: p.system });
      }

      // dormant permissions risk (last_used > 90 days or never used)
      const daysSinceUsed = a.lastUsedAt ? differenceInDays(now, a.lastUsedAt) : null;
      if (daysSinceUsed === null || daysSinceUsed > 90) {
        score += 10;
        (factors.dormant as unknown[]).push({
          permissionId: p.id,
          added: 10,
          daysSinceUsed,
        });
      }

      // role mismatch risk (not in role template)
      if (!roleDefault.has(p.id)) {
        score += 12;
        (factors.roleMismatch as unknown[]).push({ permissionId: p.id, added: 12 });
      }

      // peer deviation risk (permission is uncommon among peers)
      const peerCount = peerPermissionCounts.get(p.id) ?? 0;
      const fraction = peerCount / peerTotal;
      if (fraction < 0.2 && peerTotal >= 5) {
        score += 10;
        (factors.peerDeviation as unknown[]).push({
          permissionId: p.id,
          added: 10,
          peerFraction: fraction,
          peerTotal,
        });
      }
    }

    score = Math.max(0, Math.min(100, score));

    return await this.deps.riskScores.upsertLatest({
      userId,
      score,
      factors,
    });
  }
}

