import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');    
    try {
        const keys = await kv.keys('session:*:*');        
        if (keys.length === 0) return res.status(200).json([]); 
        const sessions = await kv.mget(...keys);
        const activeUsers = sessions.filter(s => s !== null);
        return res.status(200).json(activeUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Database Error" });
    }
}
