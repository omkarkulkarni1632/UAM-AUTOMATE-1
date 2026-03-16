"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message });
}
