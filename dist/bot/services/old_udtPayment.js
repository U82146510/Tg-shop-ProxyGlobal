"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWallet = generateWallet;
exports.getUSDTbalance = getUSDTbalance;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const decimal_js_1 = require("decimal.js");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const api = process.env.api_trcgrid;
if (!api) {
    throw new Error('missing tron GRID API');
}
const tronWeb = new tronweb_1.TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: {
        'TRON-PRO-API-KEY': `${api}`,
        'Content-Type': 'application/json'
    },
    eventServer: 'https://api.trongrid.io',
    privateKey: ''
});
async function generateWallet() {
    try {
        const account = await tronWeb.createAccount();
        return {
            address: account.address.base58,
            privateKey: account.privateKey
        };
    }
    catch (error) {
        console.error('Error generating wallet:', error instanceof Error ? error.message : error);
        return undefined;
    }
}
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
async function getUSDTbalance(address) {
    try {
        if (!tronWeb.isAddress(address)) {
            console.error('Invalid TRON address:', address);
            return undefined;
        }
        const contract = await tronWeb.contract().at(USDT_CONTRACT);
        const balance = await contract.balanceOf(address).call({
            from: address
        });
        return new decimal_js_1.Decimal(balance.toString()).div(1e6);
    }
    catch (error) {
        console.error('Error fetching USDT balance:', {
            address: address,
            error: error instanceof Error ? error.message : error
        });
        return undefined;
    }
}
async function checkConnection() {
    try {
        const block = await tronWeb.trx.getCurrentBlock();
        console.log('✅ TRON connection successful. Latest block:', block.block_header.raw_data.number);
    }
    catch (error) {
        console.error('TRON connection error:', error instanceof Error ? error.message : error);
    }
}
checkConnection();
