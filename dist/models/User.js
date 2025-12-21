import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    balance: {
      type: Schema.Types.Decimal128,
      default: Types.Decimal128.fromString("0")
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order"
      }
    ],
    hasPendingDeposit: {
      type: Boolean,
      default: false
    },
    expectedAmount: {
      type: Schema.Types.Decimal128,
      default: Types.Decimal128.fromString("0")
    },
    expectedAmountExpiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
