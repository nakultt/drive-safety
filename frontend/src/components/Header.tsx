import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Smart Driver Safety System' }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-30 lg:ml-64">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search violations, devices, events..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Profile Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">John Doe</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-shadow">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
