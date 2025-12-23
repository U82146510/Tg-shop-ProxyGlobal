"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect_db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const console_1 = require("console");
const seed_1 = require("../bot/utils/seed");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, "../../.env")
});
const connection_string = process.env.atlas;
if (!connection_string) {
    throw new Error("missing connection string");
}
const connect_db = async () => {
    try {
        await mongoose_1.default.connect(connection_string, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            maxPoolSize: 50,
            minPoolSize: 5,
            retryWrites: true,
            retryReads: true,
            connectTimeoutMS: 10000,
            heartbeatFrequencyMS: 30000,
            tls: true,
            tlsAllowInvalidCertificates: false,
            bufferCommands: false,
            waitQueueTimeoutMS: 10000,
        });
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
exports.connect_db = connect_db;
const db = mongoose_1.default.connection;
db.on('error', () => {
    console.error(console_1.error);
})
    .on('connected', async () => {
    console.info('db connected');
    await (0, seed_1.creteAdmin)();
})
    .on('disconnected', () => {
    console.info('db disconnected');
})
    .on('reconnected', () => {
    console.info('db reconnected');
});
process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});
