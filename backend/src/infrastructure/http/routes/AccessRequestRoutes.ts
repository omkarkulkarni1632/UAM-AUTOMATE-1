import { Router } from "express";
import { z } from "zod";
import { Roles, RequestTypes } from "../../../domain/constants/rbac";
import { UserUseCases } from "../../../application/usecases/UserUseCases";
import { AccessRequestRepository } from "../../../domain/repositories/AccessRequestRepository";
import { authRequired, requireRole } from "../middleware/authMiddleware";

export function buildAccessRequestRoutes(deps: {
  accessRequests: AccessRequestRepository;
  userUseCases: UserUseCases;
}) {
  const router = Router();

  // Generic endpoint mainly for starting MOVER/LEAVER from HR dashboard.
  router.post(
    "/access-request",
    authRequired,
    requireRole(Roles.HR_ADMIN),
    async (req, res, next) => {
      try {
        const body = z
          .object({
            requestType: z.enum([RequestTypes.MOVER, RequestTypes.LEAVER]),
            userId: z.string().uuid(),
            newRole: z
              .enum([
                Roles.HR_ADMIN,
                Roles.INFRA_ADMIN,
                Roles.DEPARTMENT_ADMIN,
                Roles.CISO,
                Roles.EMPLOYEE,
              ])
              .optional(),
            newDepartmentId: z.string().uuid().nullable().optional(),
          })
          .parse(req.body);

        if (body.requestType === RequestTypes.LEAVER) {
          const result = await deps.userUseCases.markEmployeeAsLeaver({
            actorUserId: req.user!.id,
            actorRole: req.user!.role,
            userId: body.userId,
          });
          return res.status(201).json(result);
        }

        if (!body.newRole) {
          return res.status(400).json({ error: "newRole required for MOVER" });
        }
        const result = await deps.userUseCases.updateEmployeeRoleOrDepartment({
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          userId: body.userId,
          newRole: body.newRole!,
          newDepartmentId: body.newDepartmentId ?? null,
        });
        return res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    }
  );

  router.get("/access-requests/stage/:stage", authRequired, async (req, res, next) => {
    try {
      const stage = z.string().parse(req.params.stage);
      const rows = await deps.accessRequests.listByStage(stage as any);
      res.json({ stage, requests: rows });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

