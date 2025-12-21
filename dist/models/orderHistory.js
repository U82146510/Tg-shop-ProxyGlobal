import mongoose from "mongoose";
const {Schema, model, Types} = mongoose;

const orderSchema = new Schema({
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
    apikey: { type: String, required: true }
}, { timestamps: true });

export const orderHistory = model('orderhistory', orderSchema);
