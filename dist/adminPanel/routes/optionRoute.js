import { Router } from "express";
import {optionsGet,optionsPost,resetCountForTestButton} from '../controllers/optionController.js';
import { protectRoute } from "../middleware/protectRoute.js";

export const optionsRoute = Router();

optionsRoute.get('/options',protectRoute,optionsGet);
optionsRoute.post('/options',protectRoute,optionsPost)
optionsRoute.post('/resetCountForTestButton',protectRoute,resetCountForTestButton)
