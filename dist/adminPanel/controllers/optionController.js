import { redis } from "../../bot/utils/redis.js";
import { z } from "zod";

const telegramContact = z.object({
    telegramId:z.string(),
});
export const resetCountForTestButton = async (req, res, next) => {
    const result = telegramContact.safeParse(req.body);

    try {
        const value = await redis.get('enableTestProxyOption');
        const enabled = value === 'true';

        if (!result.success) {
            return res.render('options', {
                error: 'error at reseting proxy for Test',
                message: null,
                enabled
            });
        }

        await redis.delete(result.data.telegramId);

        res.render('options', {
            error: null,
            message: `Reset for ${result.data.telegramId} successfully`,
            enabled
        });
    } catch (error) {
        next(error);
    }
};


export const optionsGet = async (req,res,next)=>{
    try {
        const value = await redis.get('enableTestProxyOption');
        const enabled = value === 'true';

        res.render('options',{
            error:null,message:null,enabled
        });
    } catch (error) {
        next(error)
    }
}

export const optionsPost = async (req, res, next) => {
    const { enableProxyForTest } = req.body;

    try {
        const enabled = enableProxyForTest === 'on';
        await redis.set('enableTestProxyOption', enabled ? 'true' : 'false');
        res.render('options', {
            error: null,
            message: enabled ? 'enabled' : 'disabled',
            enabled
        });
    } catch (error) {
        next(error);
    }
};
