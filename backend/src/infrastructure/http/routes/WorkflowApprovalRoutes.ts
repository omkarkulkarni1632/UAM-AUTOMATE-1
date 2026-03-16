import { Router } from "express";
import { z } from "zod";
import { Roles } from "../../../domain/constants/rbac";
import { WorkflowEngine } from "../../../application/workflow/WorkflowEngine";
import { authRequired, requireRole } from "../middleware/authMiddleware";

export function buildWorkflowApprovalRoutes(workflow: WorkflowEngine) {
  const router = Router();

  router.post(
    "/infra/approve",
    authRequired,
    requireRole(Roles.INFRA_ADMIN),
    async (req, res, next) => {
      try {
        const body = z
          .object({
            requestId: z.string().uuid(),
            basePermissionIds: z.array(z.string().uuid()).default([]),
          })
          .parse(req.body);
        const updated = await workflow.infraApprove({
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          requestId: body.requestId,
          basePermissionIds: body.basePermissionIds,
        });
        res.json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    "/department/approve",
    authRequired,
    requireRole(Roles.DEPARTMENT_ADMIN),
    async (req, res, next) => {
      try {
        const body = z
          .object({
            requestId: z.string().uuid(),
            departmentPermissionIds: z.array(z.string().uuid()).default([]),
          })
          .parse(req.body);
        const updated = await workflow.departmentApprove({
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          requestId: body.requestId,
          departmentPermissionIds: body.departmentPermissionIds,
        });
        res.json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    "/ciso/approve",
    authRequired,
    requireRole(Roles.CISO),
    async (req, res, next) => {
      try {
        const body = z
          .object({
            requestId: z.string().uuid(),
            finalPermissionIds: z.array(z.string().uuid()).default([]),
            decision: z.enum(["APPROVE", "REJECT"]),
            note: z.string().optional(),
          })
          .parse(req.body);

        const updated = await workflow.cisoApprove({
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          requestId: body.requestId,
          finalPermissionIds: body.finalPermissionIds,
          decision: body.decision,
          note: body.note,
        });
        res.json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}

