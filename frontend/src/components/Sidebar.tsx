import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  AlertTriangle,
  Eye,
  AlertCircle,
  AlertOctagon,
  BarChart3,
  Smartphone,
  FileText,
  LogOut,
  FileBarChart,
  Settings as SettingsIcon
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: AlertTriangle, label: 'Violations', href: '/violations' },
    { icon: Eye, label: 'Distractions', href: '/distractions' },
    { icon: AlertCircle, label: 'Potholes', href: '/potholes' },
    { icon: AlertOctagon, label: 'Animal Alerts', href: '/animal-alerts' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Smartphone, label: 'Devices', href: '/devices' },
    { icon: FileText, label: 'Events', href: '/events' },
    { icon: FileBarChart, label: 'Report', href: '/report' },
    { icon: SettingsIcon, label: 'Settings', href: '/settings' }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:bg-slate-50"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-100 z-40 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 lg:w-64'
        } overflow-hidden lg:overflow-visible`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SD</span>
              </div>
              {isOpen && (
                <div className="hidden lg:block">
                  <h1 className="font-bold text-slate-900">SafeDriver</h1>
                  <p className="text-xs text-slate-500">Edge AI Monitoring</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  {isOpen && <span className="font-medium text-sm hidden lg:block">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
              <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              {isOpen && <span className="font-medium text-sm hidden lg:block">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
