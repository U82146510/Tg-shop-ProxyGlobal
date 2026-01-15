import {Product} from "../../models/Products.js";


export const productPricePost = async(req,res,next)=>{
    try {
        const allProducts = await Product.find({},{apikey:0,_id:0}).lean();
        if(allProducts.length === 0){
            res.status(400).json({
                error:'Cannot get data from dbs',
                message:null
            });
            return;
        }
        res.status(200).json({
            message:allProducts
        });
    } catch (error) {
        next(error);
    }
};
