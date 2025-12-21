import { Router } from "express";
import { logService,logGet } from "../controllers/logsController.js";

export const logsRoute = Router();

logsRoute.get("/logs", logGet);

logsRoute.post("/logs", logService);

