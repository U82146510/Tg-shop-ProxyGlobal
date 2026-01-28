import {Review} from '../../models/review.js';

export const reviewController = async (req, res,next) => {
   console.log("Review controller accessed");
   try {
    const reviews = await Review.find({},{_id:0}).lean();
    res.status(200).json(reviews);
   } catch (error) {
    next(error);
   }
};
