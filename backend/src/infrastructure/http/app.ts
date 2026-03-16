import cors from "cors";
import express from "express";
import { buildRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use(buildRoutes());

  app.use(errorHandler);
  return app;
}

