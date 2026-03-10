import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Car, BarChart3, Radio, ShieldCheck } from 'lucide-react';

// Placeholders for pages we are about to create
import Dashboard from './pages/Dashboard';
import Violations from './pages/Violations';
import Vehicles from './pages/Vehicles';
import Analytics from './pages/Analytics';
import LiveFeed from './pages/LiveFeed';

const SidebarLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-500/10 text-blue-400' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#30363d] bg-[#161b22] flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-[#30363d]">
          <div className="p-2 bg-blue-500 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">PACER</h1>
            <p className="text-xs text-gray-400 font-medium">Traffic Enforcement</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink to="/live" icon={<Radio size={20} />} label="Live Feed" />
          <div className="my-4 border-t border-[#30363d]"></div>
          <SidebarLink to="/violations" icon={<AlertTriangle size={20} />} label="Violations" />
          <SidebarLink to="/vehicles" icon={<Car size={20} />} label="Vehicles" />
          <SidebarLink to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
        </nav>
        
        <div className="p-4 border-t border-[#30363d]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
            <span className="text-sm font-medium text-gray-300">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-w-0">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live" element={<LiveFeed />} />
          <Route path="/violations" element={<Violations />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
