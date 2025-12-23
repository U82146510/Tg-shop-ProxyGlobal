"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creteAdmin = creteAdmin;
const adminPanel_1 = require("../../models/adminPanel");
async function creteAdmin() {
    try {
        const user = await adminPanel_1.Auth.findOne({ username: 'admin' });
        if (!user) {
            await adminPanel_1.Auth.create({ username: 'admin', password: 'aA123456789!@#' });
            return;
        }
    }
    catch (error) {
        console.error(error);
    }
}
