import { Router } from "express";
import { metricsGet } from "../controllers/metricsController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const metricsRouter = Router();

metricsRouter.get("/",protectRoute, metricsGet);

export { metricsRouter };
