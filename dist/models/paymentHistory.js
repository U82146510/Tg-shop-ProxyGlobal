import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const paymentHistorySchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: Schema.Types.Decimal128,
        required: true
    }
}, { timestamps: true });

export const paymentHistory = model("PaymentHistory", paymentHistorySchema);
