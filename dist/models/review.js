import {Schema, model,Types} from 'mongoose';

const reviewSchema = new Schema({
    user:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true
    }
},{timestamps:true});

export const Review = model('Review',reviewSchema);