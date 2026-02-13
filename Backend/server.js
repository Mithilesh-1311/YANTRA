const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Admin Client (service role — keep this server-side only!)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Building data ─────────────────────────────────────────────
const buildings = [
    { id: 'B1', name: 'Main Admin Block', solar: 120, load: 85, battery: 78, status: 'Surplus' },
    { id: 'B2', name: 'Research Lab', solar: 45, load: 150, battery: 45, status: 'Deficit' },
    { id: 'B3', name: 'Student Dorms', solar: 80, load: 60, battery: 92, status: 'Surplus' },
    { id: 'B4', name: 'Cafeteria', solar: 30, load: 45, battery: 20, status: 'Deficit' },
    { id: 'B5', name: 'Guesthouse / EV Station', solar: 60, load: 40, battery: 85, status: 'Surplus' },
];

app.get('/api/buildings', (_req, res) => {
    // Add slight random variation to simulate real-time data
    const live = buildings.map(b => ({
        ...b,
        solar: b.solar + Math.round((Math.random() - 0.5) * 10),
        load: b.load + Math.round((Math.random() - 0.5) * 8),
        battery: Math.min(100, Math.max(0, b.battery + Math.round((Math.random() - 0.5) * 4))),
    }));
    res.json(live);
});

// ─── Grid overview ─────────────────────────────────────────────
app.get('/api/grid/overview', (_req, res) => {
    const totalSolar = buildings.reduce((sum, b) => sum + b.solar, 0);
    const totalLoad = buildings.reduce((sum, b) => sum + b.load, 0);
    res.json({
        demand: totalLoad + Math.round(Math.random() * 100),
        generation: totalSolar + Math.round(Math.random() * 80),
        frequency: +(49.9 + Math.random() * 0.2).toFixed(3),
        centralBattery: 85 + Math.round((Math.random() - 0.5) * 6),
        gridStability: 76 + Math.round((Math.random() - 0.5) * 8),
        status: 'online',
    });
});

// ─── P2P Energy Transactions ───────────────────────────────────
const transactions = [
    { id: 1, from: 'Building 2', to: 'Building 3', energy: 15, status: 'In Progress', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) },
    { id: 2, from: 'Building 4', to: 'Building 1', energy: 10, status: 'Completed', time: '12:30 PM' },
    { id: 3, from: 'Building 5', to: 'Building 3', energy: 12, status: 'Completed', time: '12:15 PM' },
    { id: 4, from: 'Building 1', to: 'Building 4', energy: 8, status: 'Completed', time: '12:05 PM' },
    { id: 5, from: 'Building 2', to: 'Building 5', energy: 8, status: 'Pending', time: '12:05 AM' },
    { id: 6, from: 'Building 4', to: 'Central Battery', energy: 25, status: 'Completed', time: '11:30 AM' },
];

app.get('/api/transactions', (_req, res) => {
    res.json(transactions);
});

// ─── Market prices ─────────────────────────────────────────────
app.get('/api/market/prices', (_req, res) => {
    res.json({
        gridBuy: +(0.13 + Math.random() * 0.04).toFixed(2),
        gridSell: +(0.06 + Math.random() * 0.04).toFixed(2),
        p2pAverage: +(0.10 + Math.random() * 0.04).toFixed(2),
        trend: Math.random() > 0.5 ? 'up' : 'down',
    });
});

// ─── Carbon credits ────────────────────────────────────────────
app.get('/api/carbon', (_req, res) => {
    res.json({
        totalEarned: 450,
        traded: 120,
        co2Offset: 1.2,
        rating: 'A+',
        offsetSources: [
            { name: 'Solar Energy', value: 520 },
            { name: 'Wind Power', value: 310 },
            { name: 'Reforestation', value: 170 },
        ],
    });
});

// ─── Forecast data ─────────────────────────────────────────────
app.get('/api/forecast', (_req, res) => {
    const data = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        actual: Math.round(4200 + Math.sin(i / 3) * 500),
        predicted: Math.round(4200 + Math.sin(i / 3) * 500 + (Math.random() - 0.5) * 100),
    }));
    res.json({ data, confidence: 98.2, model: 'LSTM v2.4' });
});

// ─── Auth: get current user (verify JWT) ───────────────────────
app.get('/api/auth/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    res.json({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 'Operator',
        created_at: user.created_at,
    });
});

// ─── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log(`[SERVER] Supabase: ${process.env.SUPABASE_URL ? 'Connected' : 'NOT configured'}`);
});
