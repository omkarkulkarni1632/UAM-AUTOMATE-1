import { Router } from "express";
import { z } from "zod";
import { Roles } from "../../../domain/constants/rbac";
import { UserUseCases } from "../../../application/usecases/UserUseCases";
import { PermissionRepository } from "../../../domain/repositories/PermissionRepository";
import { UserAccessRepository } from "../../../domain/repositories/UserAccessRepository";
import { authRequired, requireRole } from "../middleware/authMiddleware";

export function buildUserRoutes(deps: {
  userUseCases: UserUseCases;
  userAccess: UserAccessRepository;
  permissions: PermissionRepository;
}) {
  const router = Router();

  router.post(
    "/users",
    authRequired,
    requireRole(Roles.HR_ADMIN),
    async (req, res, next) => {
      try {
        const body = z
          .object({
            name: z.string().min(1),
            email: z.string().email(),
            departmentId: z.string().uuid().nullable().optional().default(null),
            role: z.enum([
              Roles.HR_ADMIN,
              Roles.INFRA_ADMIN,
              Roles.DEPARTMENT_ADMIN,
              Roles.CISO,
              Roles.EMPLOYEE,
            ]),
            managerId: z.string().uuid().nullable().optional().default(null),
            tempPassword: z.string().min(6),
          })
          .parse(req.body);

        const result = await deps.userUseCases.createEmployee(
          req.user!.id,
          req.user!.role,
          body
        );
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    }
  );

  router.get("/users/:id/access", authRequired, async (req, res, next) => {
    try {
      const userId = z.string().uuid().parse(req.params.id);
      const access = await deps.userAccess.listByUserId(userId);
      const perms = await deps.permissions.listByIds(access.map((a) => a.permissionId));
      const permById = new Map(perms.map((p) => [p.id, p]));
      res.json({
        userId,
        access: access.map((a) => ({
          ...a,
          permission: permById.get(a.permissionId) ?? null,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

