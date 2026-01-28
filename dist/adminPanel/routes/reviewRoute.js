import {Router} from 'express';
import { reviewController } from '../controllers/reviewController.js';

export const reviewRoute = Router();
reviewRoute.get('/', reviewController);