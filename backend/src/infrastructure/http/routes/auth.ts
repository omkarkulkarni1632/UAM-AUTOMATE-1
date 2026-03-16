import { Router } from "express";
import { z } from "zod";
import { AuthService } from "../../auth/AuthService";

export function buildAuthRouter(auth: AuthService) {
  const router = Router();

  router.post("/auth/login", async (req, res, next) => {
    try {
      const body = z
        .object({ email: z.string().email(), password: z.string().min(1) })
        .parse(req.body);
      const result = await auth.login(body.email, body.password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

