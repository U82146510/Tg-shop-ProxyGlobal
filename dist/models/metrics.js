import { Schema,model,Types } from "mongoose";


const metricsSchema = new Schema({
    ipAddress:{
        type: String,
        required:true
    },
    url:{
        type: String,
        required:true
    },
    device:{
        type: String,
        required:false
    },
    os:{
        type: String,
        required:false
    },
    browser:{
        type: String,
        required:false
    },
    country:{
        type: String,
        required:false
    },
    timestamp:{
        type: Date,
        required:true,
        default:Date.now,
        index: { expireAfterSeconds: 31536000 }
    }
},{
    timestamps:true
});

const Metrics = model('Metrics',metricsSchema);

export {Metrics};