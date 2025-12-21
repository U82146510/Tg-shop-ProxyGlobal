import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const incomeStatisticsSchema = new Schema({
  key: {
    type: String,
    default: "shop-status",
    unique: true
  },
  Month: {
    type: Schema.Types.Decimal128,
    default: Types.Decimal128.fromString("0")
  },
  Total: {
    type: Schema.Types.Decimal128,
    default: Types.Decimal128.fromString("0")
  },
  shop: {
    type: Schema.Types.Decimal128,
    default: Types.Decimal128.fromString("0")
  }
});

export const shopBalance = model("Shop", incomeStatisticsSchema);
