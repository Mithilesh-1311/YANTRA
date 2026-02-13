// Mock data for the Smart Grid Application

export interface DataPoint {
    time: string;
    value: number;
    value2?: number;
}

export const demandData: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 4000 + Math.random() * 1000, // Demand
    value2: 3800 + Math.random() * 1200, // Generation
}));

export const frequencyData: DataPoint[] = Array.from({ length: 60 }, (_, i) => ({
    time: `${i}s`,
    value: 49.8 + Math.random() * 0.4, // Hz
}));

export const voltageData: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 220 + Math.random() * 10 - 5, // Voltage
}));

export const forecastData: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 4200 + Math.sin(i / 3) * 500, // Actual
    value2: 4200 + Math.sin(i / 3) * 500 + (Math.random() - 0.5) * 100, // Predicted
}));

export const tradingHistory = [
    { id: 1, type: 'Buy', amount: 50, price: 0.12, status: 'Confirmed', time: '10:23 AM' },
    { id: 2, type: 'Sell', amount: 120, price: 0.11, status: 'Pending', time: '10:25 AM' },
    { id: 3, type: 'Buy', amount: 30, price: 0.13, status: 'Confirmed', time: '10:30 AM' },
    { id: 4, type: 'Sell', amount: 200, price: 0.10, status: 'Failed', time: '10:45 AM' },
    { id: 5, type: 'Buy', amount: 75, price: 0.12, status: 'Confirmed', time: '11:05 AM' },
];


export const userProfile = {
    name: 'John Doe',
    email: 'john.doe@smartgrid.io',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    accountType: 'Prosumer',
    joinDate: 'Jan 2023',
    'energy ID': 'SG-8821-9922'
};

export const systemLogs = [
    { id: 1, action: 'Login Successful', ip: '192.168.1.10', time: 'Today, 10:00 AM' },
    { id: 2, action: 'Smart Meter Sync', ip: 'Device-AF22', time: 'Today, 09:45 AM' },
    { id: 3, action: 'Trade Executed (Buy)', ip: '192.168.1.10', time: 'Yesterday, 04:30 PM' },
    { id: 4, action: 'Device Connected', ip: '192.168.1.10', time: 'Yesterday, 04:25 PM' },
    { id: 5, action: 'Password Changed', ip: '192.168.1.10', time: 'Oct 24, 2023' },
];

export const buildingStats = [
    { id: 'B1', name: 'Main Admin Block', solar: 120, load: 85, battery: 78, status: 'Surplus' },
    { id: 'B2', name: 'Research Lab', solar: 45, load: 150, battery: 45, status: 'Deficit' },
    { id: 'B3', name: 'Student Dorms', solar: 80, load: 60, battery: 92, status: 'Surplus' },
    { id: 'B4', name: 'Cafeteria', solar: 30, load: 45, battery: 20, status: 'Deficit' },
    { id: 'B5', name: 'Guesthouse / EV Station', solar: 60, load: 40, battery: 85, status: 'Surplus' },
];

export const carbonStats = [
    { label: 'Total Credits Earned', value: '450', unit: 'CC', change: '+12%', color: 'text-[var(--color-accent-green)]' },
    { label: 'Credits Traded', value: '120', unit: 'CC', change: '+5%', color: 'text-[var(--color-accent-cyan)]' },
    { label: 'CO2 Offset', value: '1.2', unit: 'Tons', change: '+8%', color: 'text-white' },
];

export const marketPrices = {
    gridBuy: 0.15,
    gridSell: 0.08,
    p2pAverage: 0.12,
    trend: 'up'
};
