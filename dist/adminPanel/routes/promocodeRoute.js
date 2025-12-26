import {Router} from 'express';
import {postPromocode,getPromocode,deletePromocode} from '../controllers/promocodeController.js'

export const promocodeRoute = Router();

promocodeRoute.get('/promocode',getPromocode);
promocodeRoute.post('/promocode',postPromocode);
promocodeRoute.post('/deletepromocode',deletePromocode);
