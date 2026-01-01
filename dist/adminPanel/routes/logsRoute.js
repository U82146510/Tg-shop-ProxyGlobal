import { Router } from "express";
import { logService,logGet } from "../controllers/logsController.js";
import { protectRoute } from "../middleware/protectRoute.js";

export const logsRoute = Router();

logsRoute.get("/logs",protectRoute, logGet);
logsRoute.post("/logs",protectRoute, logService);

