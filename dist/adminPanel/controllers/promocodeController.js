import {Promocode} from '../../models/promoCode.js';

export const getPromocode = (req,res,next)=>{
    try {
        res.status(200).render('promocode',{error:null,message:null,promocodes:[]});
    } catch (error) {
        next(error)
    }
};

export const deletePromocode = async (req,res,next)=>{
    const {promoCodeName} = req.body;
    try {
        if(!promoCodeName || typeof promoCodeName !== 'string'){
            res.status(400).render('promocode',{error:'Promocode name is required',message:null,promocodes:[]})
            return;
        }

        const isTherePromocode = await Promocode.findOneAndDelete({promoCodeName:promoCodeName.toLowerCase().trim()});
        if(!isTherePromocode){
            res.status(400).render('promocode',{error:'There is nothing to be deleted',message:null,promocodes:[]})
            return;
        }

        res.status(200).render('promocode',{error:null,message:`Promocode ${promoCodeName} deleted.`,promocodes:[]});
    } catch (error) {
        next(error)
    }
};

export const getAllPromos = async(req,res,next)=>{
    try {
        const getAllPromocodes = await Promocode.find();
        if(getAllPromocodes.length === 0){
            res.status(400).render('promocode',{error:'There is no promocodes',message:null,promocodes:[]});
            return;
        }
        res.status(200).render('promocode',{error:null,message:null,promocodes:getAllPromocodes});
    } catch (error) {
        next(error);
    }
}

export const postPromocode = async(req,res,next)=>{
    const {promoCodeName,numberOfUse,discount,numberOfDays} = req.body;

    try {
        if(!promoCodeName||!numberOfUse||!discount||!numberOfDays){
            res.status(400).render('promocode',{error:'Please fill all the fields',message:null,promocodes:[]})
            return;
        }

        const days = Number(numberOfDays);
        if(Number.isNaN(days) || days <= 0 ){
            res.status(400).render('promocode', {
                error: 'Invalid number of days',
                message: null,
                promocodes:[]
            });
            return;
        }

        const validNumberOfUse = Number(numberOfUse);
        if(Number.isNaN(validNumberOfUse) || validNumberOfUse <= 0){
            res.status(400).render('promocode', {
                error: 'Invalid number of uses',
                message: null,
                promocodes:[]
            });
            return;
        }

        const validDiscount = Number(discount);
        if(Number.isNaN(validDiscount) || validDiscount <= 0){
            res.status(400).render('promocode', {
                error: 'Invalid number for discount',
                message: null,
                promocodes:[]
            });
            return;
        }

        const currentDate = new Date();
        const millisecondsInDay = 24*60*60*1000;
        const expire = new Date(currentDate.getTime()+(millisecondsInDay * days));

        let isTherePromocode = await Promocode.findOne({promoCodeName:promoCodeName.toLowerCase().trim()});
        if(!isTherePromocode){
            isTherePromocode = await Promocode.create({
                promoCodeName:promoCodeName.toLowerCase() ,numberOfUse:validNumberOfUse,discount:validDiscount,users: [],expire
            });
            res.status(201).render('promocode',{ error: null, message: 'Promocode created successfully',promocodes:[] });
            return;
        }
        res.status(200).render('promocode',{ error: "This promocode already exists", message: null,promocodes:[] });

    } catch (error) {
        next(error)
    }
};
