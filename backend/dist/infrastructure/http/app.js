"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
function buildApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, routes_1.buildRoutes)());
    app.use(errorHandler_1.errorHandler);
    return app;
}
