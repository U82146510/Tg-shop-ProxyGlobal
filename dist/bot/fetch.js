"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProxy = getProxy;
const test = 'bb34976790defa6c149e56af35122bf7';
async function getProxy(auth) {
    const link = `https://mobileproxy.space/api.html?command=load_modems`;
    try {
        const response = await fetch(link, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const result = data.filter(value => value.canbuy === "1" && value.check_err_count === "0" && value.proxy_exp === null && value.status === "1");
        return result;
    }
    catch (error) {
        console.error(error);
    }
}
;
