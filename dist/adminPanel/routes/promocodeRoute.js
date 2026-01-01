import {Router} from 'express';
import {postPromocode,getPromocode,deletePromocode,getAllPromos} from '../controllers/promocodeController.js'
import { protectRoute } from "../middleware/protectRoute.js";
export const promocodeRoute = Router();

promocodeRoute.get('/promocode',protectRoute, getPromocode);
promocodeRoute.post('/allpromocodes',protectRoute, getAllPromos);
promocodeRoute.post('/promocode',protectRoute, postPromocode);
promocodeRoute.post('/deletepromocode',protectRoute, deletePromocode);
