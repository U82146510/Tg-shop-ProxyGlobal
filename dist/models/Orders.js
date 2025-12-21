"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
;
const orderSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    country: { type: String, required: true },
    isp: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    period: { type: String, required: true },
    eid: { type: String, required: true },
    proxy_id: { type: String, required: true },
    proxy_independent_http_hostname: { type: String, required: true },
    proxy_independent_socks5_hostname: { type: String, required: true },
    proxy_independent_port: { type: String, required: true },
    proxy_http_port: { type: String, required: true },
    proxy_socks5_port: { type: String, required: true },
    proxy_hostname: { type: String, required: true },
    proxy_change_ip_url: { type: String, required: true },
    user: { type: String, required: true },
    pass: { type: String, required: true },
    expireAt: { type: Date, required: true },
    apikey: {type: String, required:true}
});
exports.Order = (0, mongoose_1.model)('Order', orderSchema);
