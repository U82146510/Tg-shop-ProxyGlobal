import {Router} from 'express';
import {productPricePost} from '../controllers/productsPriceController.js';

export const productsPrice = Router();
productsPrice.get('/productsprice',productPricePost);
