"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
;
const producSchema = new mongoose_1.Schema({
    country: { type: String, required: true, lowercase: true },
    isp: { type: String, required: true, lowercase: true },
    period: { type: String, required: true },
    price: { type: String, required: true },
    apikey: { type: String, required: true }
});
exports.Product = (0, mongoose_1.model)('Product', producSchema);
