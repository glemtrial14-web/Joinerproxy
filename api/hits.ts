import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { receiver } = req.query;
    if (!receiver) return res.status(400).json([]);

    try {
        const keys = await kv.keys(`session:${receiver}:*`);
        if (keys.length === 0) return res.status(200).json([]); 

        const sessions = await kv.mget(...keys);
        const activeUsers = sessions.filter(s => s !== null);

        return res.status(200).json(activeUsers);
    } catch (error) {
        return res.status(500).json({ error: "Internal Error" });
    }
}
