"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProxy = fetchProxy;
exports.canBuyOff = canBuyOff;
;

//const date_fns_1 = require("date-fns");
//const periodDays = parseInt(1, 10);
//if (isNaN(periodDays) || periodDays <= 0) {
//   throw new Error('Invalid period value');
//}
//const expireAt = (0, date_fns_1.addDays)(new Date(), periodDays);
//const expireProxy = (0, date_fns_1.format)(expireAt, 'yyyy-MM-dd HH:mm:ss');


async function fetchProxy(eid, proxy_comment, proxy_exp,apikey) { // Functia de arenda la proxy
    await canBuyOff(eid,apikey);
    const encodedComment = encodeURIComponent(proxy_comment);
    const encodedExpire = encodeURIComponent(proxy_exp);
    const url = `https://mobileproxy.space/api.html?command=add_self_proxy&eid=${eid}&proxy_comment=${encodedComment}&proxy_exp=${encodedExpire}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${apikey}` }
        });
        const data = await response.json();
        const loginDetails = await fetchProxyID(data.pid,apikey);
        return loginDetails;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
;

//fetchProxy("24362","1234556",expireProxy,"bb34976790defa6c149e56af35122bf7").then(data=>console.log(data)).catch(err=>console.log(err))

async function fetchProxyID(id,apikey) { //Functia cerem info proxy arendat dupa id(proxyID)
    const url = `https://mobileproxy.space/api.html?command=get_my_proxy&proxy_id=${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { "Authorization": `Bearer ${apikey}` }
        });
        const data = await response.json();
        const proxyAllRelatedData = data[0];
        await stopProxyAutoRenewal(proxyAllRelatedData.proxy_id,apikey);
        return proxyAllRelatedData;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
;
async function stopProxyAutoRenewal(id,apikey) {
    const url = `https://mobileproxy.space/api.html?command=edit_proxy&proxy_id=${id}&proxy_auto_renewal=0`;
    try {
        await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${apikey}`
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}
;
async function canBuyOff(eid,apikey,status = "0") {
    const url = `https://mobileproxy.space/api.html?command=edit_modems&eid=${eid}&canbuy=${status}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${apikey}` }
        });
        const data = await response.json();
        console.log(data);
    }
    catch (error) {
        console.error(error);
    }
}
;
