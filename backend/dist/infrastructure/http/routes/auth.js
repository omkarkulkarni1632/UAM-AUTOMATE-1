"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthRouter = buildAuthRouter;
const express_1 = require("express");
const zod_1 = require("zod");
function buildAuthRouter(auth) {
    const router = (0, express_1.Router)();
    router.post("/auth/login", async (req, res, next) => {
        try {
            const body = zod_1.z
                .object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(1) })
                .parse(req.body);
            const result = await auth.login(body.email, body.password);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
