import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { createAdmin } from '../bot/utils/seed.js';

dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

const connection_string = process.env.atlas;
if (!connection_string) {
    throw new Error("Missing connection string");
}

export const connect_db = async () => {
    try {
        await mongoose.connect(connection_string, {
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
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const db = mongoose.connection;

db.on('error', (err) => {
    console.error(err);
});

db.on('connected', async () => {
    console.info('DB connected');
    await createAdmin();
});

db.on('disconnected', () => {
    console.info('DB disconnected');
});

db.on('reconnected', () => {
    console.info('DB reconnected');
});

process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});
