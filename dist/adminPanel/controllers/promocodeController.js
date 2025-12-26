import {Promocode} from '../../models/promoCode.js';

export const getPromocode = (req,res,next)=>{
    try {
        res.status(200).render('promocode',{error:null,message:null});
    } catch (error) {
        next(error)
    }
};

export const deletePromocode = async (req,res,next)=>{
    const {promoCodeName} = req.body;
    try {
        if(!promoCodeName || typeof promoCodeName !== 'string'){
            res.status(400).render('promocode',{error:'Promocode name is required',message:null})
            return;
        }

        const isTherePromocode = await Promocode.findOneAndDelete({promoCodeName:promoCodeName.toLowerCase()});
        if(!isTherePromocode){
            res.status(400).render('promocode',{error:'There is nothing to be deleted',message:null})
            return;
        }

        res.status(200).render('promocode',{error:null,message:`Promocode ${promoCodeName} deleted.`});
    } catch (error) {
        next(error)
    }
};

export const postPromocode = async(req,res,next)=>{
    const {promoCodeName,numberOfUse,discount,numberOfDays} = req.body;

    try {
        if(!promoCodeName||!numberOfUse||!discount||!numberOfDays){
            res.status(400).render('promocode',{error:'Please fill all the fields',message:null})
            return;
        }

        const days = Number(numberOfDays);
        if(Number.isNaN(days) || days <= 0 ){
            res.status(400).render('promocode', {
                error: 'Invalid number of days',
                message: null
            });
            return;
        }

        const validNumberOfUse = Number(numberOfUse);
        if(Number.isNaN(validNumberOfUse) || validNumberOfUse <= 0){
            res.status(400).render('promocode', {
                error: 'Invalid number of uses',
                message: null
            });
            return;
        }

        const validDiscount = Number(discount);
        if(Number.isNaN(validDiscount) || validDiscount <= 0){
            res.status(400).render('promocode', {
                error: 'Invalid number for discount',
                message: null
            });
            return;
        }

        const currentDate = new Date();
        const millisecondsInDay = 24*60*60*1000;
        const expire = new Date(currentDate.getTime()+(millisecondsInDay * days));

        let isTherePromocode = await Promocode.findOne({promoCodeName:promoCodeName.toLowerCase()});
        if(!isTherePromocode){
            isTherePromocode = await Promocode.create({
                promoCodeName:promoCodeName.toLowerCase() ,numberOfUse:validNumberOfUse,discount:validDiscount,users: [],expire
            });
            res.status(201).render('promocode',{ error: null, message: 'Promocode created successfully' });
            return;
        }
        res.status(200).render('promocode',{ error: "This promocode already exists", message: null });

    } catch (error) {
        next(error)
    }
};
