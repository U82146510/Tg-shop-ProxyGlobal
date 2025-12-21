 import {TronWeb} from "tronweb";
import dotenv from "dotenv";
import path from "path";
import Decimal from "decimal.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const api = process.env.api_trcgrid;
if (!api) {
  throw new Error("missing tron GRID API");
}

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: {
    "TRON-PRO-API-KEY": api,
    "Content-Type": "application/json"
  },
  eventServer: "https://api.trongrid.io",
  privateKey: ""
});

const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";


export async function getUSDTtransactions(address, limit = 100, offset = 0) {

  try {
    const response = await fetch(
      `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20` +
      `?contract_address=${USDT_CONTRACT}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'TRON-PRO-API-KEY': api,
          'Accept': 'application/json'
        }
      }
    );

    // 🔑 THIS IS THE IMPORTANT PART
    if (response.status === 400) {
      // No TRC20 transactions yet
      return [];
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.data.map(tx => {
      const decimals = tx.token_info.decimals;
      return new Decimal(tx.value)
        .dividedBy(new Decimal(10).pow(decimals))
        .toString();
    });

  } catch (error) {
    console.error("Error fetching USDT transactions:", {
      address,
      error: error instanceof Error ? error.message : error
    });
    return [];
  }
}




async function checkConnection() {
  try {
    const block = await tronWeb.trx.getCurrentBlock();
    console.log(
      "✅ TRON connection successful. Latest block:",
      block.block_header.raw_data.number
    );
  } catch (error) {
    console.error(
      "TRON connection error:",
      error instanceof Error ? error.message : error
    );
  }
};

checkConnection();
