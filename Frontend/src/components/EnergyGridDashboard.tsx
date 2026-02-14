import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchBuildings } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
type BuildingStatus = 'surplus' | 'deficit' | 'neutral';

interface BuildingState {
    building_id: string;
    name: string;
    battery_level_percentage: number;
    current_status: BuildingStatus;
    net_flow_kw: number;
    solar_kw: number;
    load_kw: number;
    ai_prediction: string;
}

interface BlockchainTransaction {
    id: string;
    timestamp: string;
    from: string;
    to: string;
    amount_kwh: number;
    hash: string;
    status: 'confirmed' | 'pending';
}

interface EnergyFlow {
    from: string;
    to: string;
    amount: number;
    type: 'hub' | 'p2p';
}

// ─── Mock Data Engine (Swappable) ────────────────────────────────────────────
const BUILDING_NAMES = ['Solar Tower', 'Wind Spire', 'Eco Block', 'Green Vault', 'Helios Lab'];
const PREDICTIONS = ['Surplus expected +2h', 'Deficit in ~1h', 'Stable output', 'Ramping solar', 'Peak load soon'];

function generateHash(): string {
    return '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateBuildingStates(): BuildingState[] {
    return BUILDING_NAMES.map((name, i) => {
        const battery = Math.floor(Math.random() * 80) + 15;
        const solar = Math.floor(Math.random() * 12) + 1;
        const load = Math.floor(Math.random() * 10) + 2;
        const net = solar - load;
        const status: BuildingStatus = net > 2 ? 'surplus' : net < -2 ? 'deficit' : 'neutral';
        return {
            building_id: `B${i + 1}`,
            name,
            battery_level_percentage: Math.min(100, Math.max(5, battery)),
            current_status: status,
            net_flow_kw: parseFloat(net.toFixed(1)),
            solar_kw: solar,
            load_kw: load,
            ai_prediction: PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)],
        };
    });
}

function generateTransaction(buildings: BuildingState[]): BlockchainTransaction {
    const surplus = buildings.filter(b => b.current_status === 'surplus');
    const deficit = buildings.filter(b => b.current_status === 'deficit');
    const from = surplus.length > 0
        ? surplus[Math.floor(Math.random() * surplus.length)].building_id
        : buildings[Math.floor(Math.random() * buildings.length)].building_id;
    const to = deficit.length > 0
        ? deficit[Math.floor(Math.random() * deficit.length)].building_id
        : 'GRID';
    const now = new Date();
    return {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now.toLocaleTimeString('en-US', { hour12: false }),
        from,
        to,
        amount_kwh: parseFloat((Math.random() * 4 + 0.5).toFixed(2)),
        hash: generateHash(),
        status: Math.random() > 0.15 ? 'confirmed' : 'pending',
    };
}

/** Replace this hook with your real WebSocket / API data source */
function useEnergyData() {
    const [buildings, setBuildings] = useState<BuildingState[]>(generateBuildingStates());
    const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
    const [flows, setFlows] = useState<EnergyFlow[]>([]);

    useEffect(() => {
        // Fetch from API OR fall back to mock
        const refreshBuildings = async () => {
            try {
                const apiBuildings = await fetchBuildings();
                const mapped: BuildingState[] = apiBuildings.map((b, i) => {
                    const solar = b.solar || 0;
                    const load = b.load || 0;
                    const net = solar - load;
                    const status: BuildingStatus = net > 2 ? 'surplus' : net < -2 ? 'deficit' : 'neutral';
                    return {
                        building_id: b.id,
                        name: b.name || BUILDING_NAMES[i] || b.id,
                        battery_level_percentage: Math.min(100, Math.max(5, b.battery || 50)),
                        current_status: status,
                        net_flow_kw: parseFloat(net.toFixed(1)),
                        solar_kw: solar,
                        load_kw: load,
                        ai_prediction: PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)],
                    };
                });
                setBuildings(mapped);

                // Derive flows
                const surplus = mapped.filter(b => b.current_status === 'surplus');
                const deficit = mapped.filter(b => b.current_status === 'deficit');
                const neutral = mapped.filter(b => b.current_status === 'neutral');
                const newFlows: EnergyFlow[] = [];
                surplus.forEach((s, si) => {
                    deficit.forEach((d, di) => {
                        newFlows.push({
                            from: s.building_id,
                            to: d.building_id,
                            amount: Math.abs(s.net_flow_kw),
                            type: (si + di) % 2 === 0 ? 'p2p' : 'hub',
                        });
                    });
                });
                if (neutral.length > 0 && surplus.length > 0) {
                    newFlows.push({
                        from: surplus[0].building_id,
                        to: neutral[0].building_id,
                        amount: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
                        type: 'p2p',
                    });
                }
                setFlows(newFlows);
            } catch {
                // Fallback to mock
                const newBuildings = generateBuildingStates();
                setBuildings(newBuildings);
                const surplus = newBuildings.filter(b => b.current_status === 'surplus');
                const deficit = newBuildings.filter(b => b.current_status === 'deficit');
                const newFlows: EnergyFlow[] = [];
                surplus.forEach((s, si) => {
                    deficit.forEach((d, di) => {
                        newFlows.push({
                            from: s.building_id,
                            to: d.building_id,
                            amount: Math.abs(s.net_flow_kw),
                            type: (si + di) % 2 === 0 ? 'p2p' : 'hub',
                        });
                    });
                });
                setFlows(newFlows);
            }
        };

        refreshBuildings();
        const buildingInterval = setInterval(refreshBuildings, 3000);

        // Generate new transaction every 2.5 seconds
        const txInterval = setInterval(() => {
            setBuildings(prev => {
                const tx = generateTransaction(prev);
                setTransactions(old => [tx, ...old].slice(0, 50));
                return prev;
            });
        }, 2500);

        return () => {
            clearInterval(buildingInterval);
            clearInterval(txInterval);
        };
    }, []);

    return { buildings, transactions, flows };
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

/** Battery ring chart (SVG) */
const BatteryRing: React.FC<{ percent: number; status: BuildingStatus; size?: number }> = ({
    percent, status, size = 52,
}) => {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (circ * percent) / 100;
    const color = status === 'surplus' ? 'var(--color-positive)' : status === 'deficit' ? 'var(--color-negative)' : 'var(--color-accent)';

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={4} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
                strokeLinecap="round" strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            />
            <text
                x={size / 2} y={size / 2}
                textAnchor="middle" dominantBaseline="central"
                style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 11, fontWeight: 700, fill: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
            >
                {percent}%
            </text>
        </svg>
    );
};

/** Building card mini-dashboard */
const BuildingCard: React.FC<{ building: BuildingState }> = ({ building }) => {
    const statusColors: Record<BuildingStatus, string> = {
        surplus: 'var(--color-positive)',
        deficit: 'var(--color-negative)',
        neutral: 'var(--color-accent)',
    };
    const statusBg: Record<BuildingStatus, string> = {
        surplus: 'rgba(52, 211, 153, 0.12)',
        deficit: 'rgba(248, 113, 113, 0.12)',
        neutral: 'rgba(0, 212, 255, 0.12)',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                minWidth: 0,
            }}
        >
            <BatteryRing percent={building.battery_level_percentage} status={building.current_status} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                        {building.building_id}
                    </span>
                    <span style={{
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                        padding: '2px 8px', borderRadius: 4,
                        background: statusBg[building.current_status],
                        color: statusColors[building.current_status],
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {building.current_status}
                    </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    {building.name}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
                    <span>☀ {building.solar_kw} kW</span>
                    <span>⚡ {building.load_kw} kW</span>
                    <span style={{ color: building.net_flow_kw >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                        {building.net_flow_kw >= 0 ? '+' : ''}{building.net_flow_kw} kW
                    </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4, fontStyle: 'italic' }}>
                    AI: {building.ai_prediction}
                </div>
            </div>
        </motion.div>
    );
};

/** Blockchain ledger panel */
const BlockchainLedger: React.FC<{ transactions: BlockchainTransaction[] }> = ({ transactions }) => {
    const ledgerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ledgerRef.current) {
            ledgerRef.current.scrollTop = 0;
        }
    }, [transactions.length]);

    return (
        <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-positive)', animation: 'egdPulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Blockchain Ledger
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {transactions.length} TXs
                </span>
            </div>
            <div ref={ledgerRef} style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
            }}>
                <AnimatePresence initial={false}>
                    {transactions.length === 0 && (
                        <div style={{ padding: '24px 18px', color: 'var(--color-text-dim)', textAlign: 'center', fontSize: 12 }}>
                            Awaiting transactions…
                        </div>
                    )}
                    {transactions.map((tx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: 20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            style={{
                                padding: '8px 18px',
                                borderBottom: '1px solid var(--color-border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--color-text-dim)' }}>{tx.timestamp}</span>
                                <span style={{
                                    fontSize: 9, padding: '1px 6px', borderRadius: 3, fontWeight: 600,
                                    background: tx.status === 'confirmed' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                                    color: tx.status === 'confirmed' ? 'var(--color-positive)' : 'var(--color-warning)',
                                }}>
                                    {tx.status === 'confirmed' ? '✓ CONFIRMED' : '⏳ PENDING'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: 'var(--color-positive)' }}>{tx.from}</span>
                                <span style={{ color: 'var(--color-text-dim)' }}>→</span>
                                <span style={{ color: 'var(--color-accent)' }}>{tx.to}</span>
                                <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-text)' }}>
                                    {tx.amount_kwh} kWh
                                </span>
                            </div>
                            <div style={{ color: 'var(--color-text-dim)', fontSize: 10 }}>{tx.hash}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─── Grid Map (SVG) ──────────────────────────────────────────────────────────

// Pentagon layout positions for 5 buildings around a central hub
const MAP_W = 600;
const MAP_H = 420;
const CX = MAP_W / 2;
const CY = MAP_H / 2;
const RADIUS = 155;

function getBuildingPos(index: number): { x: number; y: number } {
    const angle = ((2 * Math.PI) / 5) * index - Math.PI / 2;
    return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) };
}

const BUILDING_POSITIONS = Array.from({ length: 5 }, (_, i) => getBuildingPos(i));

/** Animated particle along a path */
const FlowParticle: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; delay: number }> = ({
    x1, y1, x2, y2, color, delay,
}) => {
    return (
        <>
            {/* Glow line */}
            <motion.line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth={2}
                strokeOpacity={0.15}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            {/* Moving particle */}
            <motion.circle
                r={4}
                fill={color}
                filter="url(#egdGlow)"
                initial={{ cx: x1, cy: y1, opacity: 0 }}
                animate={{
                    cx: [x1, (x1 + x2) / 2, x2],
                    cy: [y1, (y1 + y2) / 2, y2],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay,
                }}
            />
            {/* Second particle offset */}
            <motion.circle
                r={3}
                fill={color}
                filter="url(#egdGlow)"
                initial={{ cx: x1, cy: y1, opacity: 0 }}
                animate={{
                    cx: [x1, (x1 + x2) / 2, x2],
                    cy: [y1, (y1 + y2) / 2, y2],
                    opacity: [0, 0.7, 0],
                }}
                transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: delay + 0.8,
                }}
            />
        </>
    );
};

/** Building node on the grid map */
const BuildingNode: React.FC<{ x: number; y: number; building: BuildingState }> = ({ x, y, building }) => {
    const color = building.current_status === 'surplus' ? 'var(--color-positive)'
        : building.current_status === 'deficit' ? 'var(--color-negative)' : 'var(--color-accent)';
    const fillBg = building.current_status === 'surplus' ? 'rgba(52,211,153,0.08)'
        : building.current_status === 'deficit' ? 'rgba(248,113,113,0.08)' : 'rgba(0,212,255,0.08)';

    return (
        <g>
            {/* Outer pulse ring */}
            <motion.circle
                cx={x} cy={y} r={32}
                fill="none" stroke={color} strokeWidth={1}
                initial={{ opacity: 0.3, scale: 1 }}
                animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${x}px ${y}px` }}
            />
            {/* Building shape */}
            <motion.rect
                x={x - 22} y={y - 22} width={44} height={44} rx={8}
                fill={fillBg} stroke={color} strokeWidth={1.5}
                whileHover={{ scale: 1.1 }}
                style={{ transformOrigin: `${x}px ${y}px`, cursor: 'pointer' }}
            />
            {/* Building icon (simple house shape) */}
            <path
                d={`M${x - 10} ${y + 6} L${x - 10} ${y - 2} L${x} ${y - 12} L${x + 10} ${y - 2} L${x + 10} ${y + 6} Z`}
                fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round"
            />
            <rect x={x - 3} y={y} width={6} height={6} fill={color} opacity={0.6} rx={1} />
            {/* Label */}
            <text
                x={x} y={y + 38}
                textAnchor="middle" fill="var(--color-text)"
                style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            >
                {building.building_id}
            </text>
            <text
                x={x} y={y + 50}
                textAnchor="middle" fill="var(--color-text-dim)"
                style={{ fontSize: 9, fontFamily: 'var(--font-mono)' }}
            >
                {building.net_flow_kw >= 0 ? '+' : ''}{building.net_flow_kw} kW
            </text>
        </g>
    );
};

/** Central hub node */
const CentralHub: React.FC = () => {
    return (
        <g>
            {/* Rotating outer ring */}
            <motion.circle
                cx={CX} cy={CY} r={40}
                fill="none" stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="6 4"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
            {/* Inner hub */}
            <circle cx={CX} cy={CY} r={30} fill="rgba(0,212,255,0.06)" stroke="var(--color-accent)" strokeWidth={2} />
            {/* Server icon */}
            <rect x={CX - 10} y={CY - 14} width={20} height={8} rx={2} fill="none" stroke="var(--color-accent)" strokeWidth={1.2} />
            <rect x={CX - 10} y={CY - 3} width={20} height={8} rx={2} fill="none" stroke="var(--color-accent)" strokeWidth={1.2} />
            <rect x={CX - 10} y={CY + 8} width={20} height={8} rx={2} fill="none" stroke="var(--color-accent)" strokeWidth={1.2} />
            {/* Dots on server */}
            <circle cx={CX - 5} cy={CY - 10} r={1.5} fill="var(--color-accent)" />
            <circle cx={CX - 5} cy={CY + 1} r={1.5} fill="var(--color-positive)" />
            <circle cx={CX - 5} cy={CY + 12} r={1.5} fill="var(--color-accent)" />
            {/* Label */}
            <text
                x={CX} y={CY + 50}
                textAnchor="middle" fill="var(--color-accent)"
                style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            >
                CENTRAL HUB
            </text>
        </g>
    );
};

const GridMap: React.FC<{ buildings: BuildingState[]; flows: EnergyFlow[] }> = ({ buildings, flows }) => {
    const getFlowColor = useCallback((fromId: string) => {
        const b = buildings.find(b => b.building_id === fromId);
        return b?.current_status === 'surplus' ? '#34d399' : b?.current_status === 'deficit' ? '#f87171' : '#00d4ff';
    }, [buildings]);

    return (
        <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: 16,
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4,
            }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', animation: 'egdPulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Energy Grid Map
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {flows.length} active flows
                </span>
            </div>
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" style={{ maxHeight: 420 }}>
                <defs>
                    <filter id="egdGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="egdBgGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(0,212,255,0.03)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                </defs>

                {/* Background glow */}
                <rect width={MAP_W} height={MAP_H} fill="url(#egdBgGrad)" />

                {/* Static connection lines from hub to each building */}
                {BUILDING_POSITIONS.map((pos, i) => (
                    <line
                        key={`conn-${i}`}
                        x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                        stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 6" opacity={0.4}
                    />
                ))}

                {/* Static P2P mesh lines between all buildings */}
                {BUILDING_POSITIONS.map((posA, i) =>
                    BUILDING_POSITIONS.map((posB, j) => {
                        if (j <= i) return null;
                        return (
                            <line
                                key={`p2p-mesh-${i}-${j}`}
                                x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
                                stroke="var(--color-border)" strokeWidth={0.5} strokeDasharray="2 8" opacity={0.2}
                            />
                        );
                    })
                )}

                {/* Active flow animations */}
                {flows.map((flow, i) => {
                    const fromIdx = buildings.findIndex(b => b.building_id === flow.from);
                    const toIdx = buildings.findIndex(b => b.building_id === flow.to);
                    if (fromIdx === -1 || toIdx === -1) return null;

                    const fromPos = BUILDING_POSITIONS[fromIdx];
                    const toPos = BUILDING_POSITIONS[toIdx];
                    const color = getFlowColor(flow.from);

                    if (flow.type === 'p2p') {
                        // Direct P2P: building → building (no hub)
                        return (
                            <React.Fragment key={`flow-${i}`}>
                                <FlowParticle
                                    x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}
                                    color={color} delay={i * 0.4}
                                />
                            </React.Fragment>
                        );
                    }

                    // Hub-routed: building → hub → building
                    return (
                        <React.Fragment key={`flow-${i}`}>
                            {/* From → Hub */}
                            <FlowParticle
                                x1={fromPos.x} y1={fromPos.y} x2={CX} y2={CY}
                                color={color} delay={i * 0.3}
                            />
                            {/* Hub → To */}
                            <FlowParticle
                                x1={CX} y1={CY} x2={toPos.x} y2={toPos.y}
                                color={color} delay={i * 0.3 + 0.6}
                            />
                        </React.Fragment>
                    );
                })}

                {/* Central hub */}
                <CentralHub />

                {/* Building nodes */}
                {buildings.map((b, i) => (
                    <BuildingNode key={b.building_id} x={BUILDING_POSITIONS[i].x} y={BUILDING_POSITIONS[i].y} building={b} />
                ))}
            </svg>

            {/* Legend */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8,
                fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-positive)' }} /> Surplus
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-negative)' }} /> Deficit
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} /> Neutral
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 2, background: 'var(--color-border)' }} /> Hub Link
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 12, height: 0, borderTop: '1px dashed var(--color-warning)', display: 'inline-block' }} /> P2P Trade
                </span>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const EnergyGridDashboard: React.FC = () => {
    const { buildings, transactions, flows } = useEnergyData();

    return (
        <div
            id="energy-grid-dashboard"
            style={{
                position: 'relative',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-text)',
                isolation: 'isolate',
            }}
        >
            {/* Scoped keyframe animations */}
            <style>{`
        @keyframes egdPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

            {/* Section Header */}
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <h2 style={{
                    fontSize: 28, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8,
                    letterSpacing: '-0.02em',
                }}>
                    Live Energy Grid
                </h2>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto' }}>
                    Real-time P2P energy flow across 5 autonomous buildings, powered by AI predictions and secured on blockchain.
                </p>
            </div>


            {/* Two-column layout: Grid Map + Ledger */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 340px',
                gap: 16,
                marginBottom: 16,
            }}>
                <GridMap buildings={buildings} flows={flows} />
                <div style={{ height: 520 }}>
                    <BlockchainLedger transactions={transactions} />
                </div>
            </div>

            {/* Building Cards Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 12,
            }}>
                {buildings.map((b) => (
                    <BuildingCard key={b.building_id} building={b} />
                ))}
            </div>

            {/* Responsive overrides */}
            <style>{`
        @media (max-width: 1100px) {
          #energy-grid-dashboard > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
          #energy-grid-dashboard > div:nth-child(3) > div:last-child {
            height: 300px !important;
          }
        }
        @media (max-width: 768px) {
          #energy-grid-dashboard > div:nth-child(4) {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 500px) {
          #energy-grid-dashboard > div:nth-child(4) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default EnergyGridDashboard;
