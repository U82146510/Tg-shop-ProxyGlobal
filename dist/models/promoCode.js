import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const promocodeSchema = new Schema({
    promoCodeName:{
        type: String,
        required:true
    },
    numberOfUse:{
        type: Number,
        required:true
    },
    discount:{
        type: Schema.Types.Decimal128,
        required:true
    },
    users:[{
        type:String,
    }]
    ,
    expire:{
        type:Date,
        required:true
    },    
},{
    timestamps:true
});

promocodeSchema.methods.isExpired = function(){
    try {
        return this.expire < new Date();
    } catch (error) {
        return "Error at checking expired field"
    }
}

export const Promocode = model('Promocode',promocodeSchema);
