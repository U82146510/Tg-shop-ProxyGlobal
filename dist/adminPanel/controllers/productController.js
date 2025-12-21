"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.productGet = void 0;
const Products_1 = require("../../models/Products");
const zod_1 = require("zod");
const schemaProduct = zod_1.z.object({
    country: zod_1.z.string(),
    isp: zod_1.z.string(),
    period: zod_1.z.string(),
    price: zod_1.z.coerce.number(),
    apikey: zod_1.z.string()
});
const productGet = async (req, res, next) => {
    try {
        res.render('product', { error: null, message: null });
    }
    catch (error) {
        next(error);
    }
};
exports.productGet = productGet;
const createProduct = async (req, res, next) => {
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.status(400).render('product', { error: 'Wrong input', message: null });
            return;
        }
        const { country, isp, period, price, apikey } = parsed.data;
        const createProduct = await Products_1.Product.create({
            country: country.toLowerCase(),
            isp: isp.toLowerCase(),
            period: period,
            price: price,
            apikey: apikey
        });
        res.status(201).render('product', { error: null, message: `Pruduct ${createProduct.country} created` });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const deleteProduct = async (req, res, next) => {
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.status(400).render('product', { error: 'Wrong input', message: null });
            return;
        }
        const { country, isp, period, price, apikey } = parsed.data;
        const deleteProduct = await Products_1.Product.findOneAndDelete({
            country: country.toLowerCase(),
            isp: isp.toLocaleLowerCase(),
            period,
            price,
            apikey
        });
        if (!deleteProduct) {
            return res.status(404).render('product', { error: 'Product not found', message: null });
        }
        res.status(200).render('product', { error: null, message: `Product ${deleteProduct?.country} deleted` });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const updateProduct = async (req, res, next) => {
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if (!parsed.success) {
            res.status(400).render('product', { error: 'Wrong input', message: null });
            return;
        }
        const { country, isp, period, price, apikey } = parsed.data;
        const updateProduct = await Products_1.Product.findOneAndUpdate({
            country: country.toLowerCase(),
            isp: isp.toLocaleLowerCase(),
            period: period,
            apikey: apikey
        }, {
            $set: {
                price: price
            }
        }, { new: true });
        if (!updateProduct) {
            return res.status(404).render('product', { error: 'Product not found', message: null });
        }
        res.status(200).render('product', { error: null, message: `Product ${updateProduct.country} updated` });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
