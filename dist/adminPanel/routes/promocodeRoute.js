import {Router} from 'express';
import {postPromocode,getPromocode,deletePromocode,getAllPromos} from '../controllers/promocodeController.js'

export const promocodeRoute = Router();

promocodeRoute.get('/promocode',getPromocode);
promocodeRoute.post('/allpromocodes',getAllPromos);
promocodeRoute.post('/promocode',postPromocode);
promocodeRoute.post('/deletepromocode',deletePromocode);
