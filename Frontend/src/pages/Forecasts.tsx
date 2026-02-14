import React, { useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { fetchForecast } from '../services/api';
import type { ForecastResponse } from '../services/api';
import { forecastData as fallbackForecastRaw, buildingStats as fallbackBuildingStats } from '../services/mockData';

// Convert mockData forecastData (value/value2) into actual/predicted shape
const fallbackForecast = fallbackForecastRaw.map(d => ({
    time: d.time,
    actual: Math.round(d.value),
    predicted: Math.round(d.value2 ?? d.value),
}));

const Forecasts: React.FC = () => {
    const [forecastData, setForecastData] = useState(fallbackForecast);
    const [buildingSurplusDeficit, setBuildingSurplusDeficit] = useState<{ name: string; value: number; building: string }[]>(
        fallbackBuildingStats.map(b => ({ name: b.name.split(' ')[0], value: b.solar - b.load, building: b.name }))
    );
    const [confidence, setConfidence] = useState(98.2);
    const [model, setModel] = useState('LSTM v2.4');

    const refresh = useCallback(async () => {
        try {
            const data: ForecastResponse = await fetchForecast();
            setForecastData(data.data);
            setBuildingSurplusDeficit(data.buildingSurplusDeficit);
            setConfidence(data.confidence);
            setModel(data.model);
        } catch (err) {
            console.warn('[Forecasts] API fallback to mock:', err);
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, 8000);
        return () => clearInterval(id);
    }, []);

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'white',
        },
    };

    const peakPredicted = forecastData.length > 0
        ? Math.max(...forecastData.map(d => d.predicted)) + ' kW'
        : '5,200 kW';

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-white">AI Load Forecast</h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-dim)]" style={{ fontFamily: 'var(--font-mono)' }}>
                        MODEL: {model}
                    </span>
                    <span className="badge badge-positive">LIVE</span>
                </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { label: 'Predicted Peak Load', value: peakPredicted, color: 'text-[var(--color-accent)]' },
                    { label: 'Model Confidence', value: `${confidence}%`, color: 'text-white' },
                ].map(m => (
                    <div key={m.label} className="card p-5">
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{m.label}</p>
                        <p className={`text-2xl font-bold ${m.color}`} style={{ fontFamily: 'var(--font-mono)' }}>{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 24h Prediction Line Chart */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">24-Hour Prediction</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <Tooltip {...tooltipStyle} />
                                <Line type="monotone" dataKey="actual" stroke="#00e5ff" strokeWidth={2} dot={false} name="Actual" />
                                <Line type="monotone" dataKey="predicted" stroke="#00ffa3" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Predicted" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Building Surplus/Deficit Bar Chart */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Building Surplus / Deficit</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={buildingSurplusDeficit}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="value" name="Net kW">
                                    {buildingSurplusDeficit.map((entry, index) => (
                                        <Cell key={index} fill={entry.value >= 0 ? '#00ffa3' : '#ff3366'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forecasts;
