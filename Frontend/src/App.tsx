import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './pages/Dashboard';
import Charts from './pages/Charts';
import Forecasts from './pages/Forecasts';
import Trading from './pages/Trading';
import Carbon from './pages/Carbon';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Purchases from './pages/Purchases';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="charts" element={<Charts />} />
          <Route path="forecasts" element={<Forecasts />} />
          <Route path="trading" element={<Trading />} />
          <Route path="carbon" element={<Carbon />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="history" element={<History />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
