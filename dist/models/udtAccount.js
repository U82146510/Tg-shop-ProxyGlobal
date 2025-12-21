import mongoose from "mongoose";

export const usdtAccountSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            required: true,
            unique: true,
            default: "Tv1uwzCzhLG9MP1SnGdswEGraGnD1xQj2"
        }
    }
);

export const UsdtAccount = mongoose.model("UsdtAccount", usdtAccountSchema);
