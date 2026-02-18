// Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/violations', label: 'Violations' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/offenders', label: 'Offenders' },
  { to: '/reports', label: 'Reports' },
  { to: '/heatmap', label: 'Heatmap' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="bg-white border-r border-gray-200 min-h-screen w-64 flex flex-col shadow-sm">
      <div className="flex items-center justify-center h-20 border-b border-gray-200">
        <span className="text-2xl font-bold text-blue-600">🚦 City Admin</span>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-xl font-medium text-gray-800 hover:bg-gray-50 transition ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
            }
            end
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        className="flex items-center gap-2 px-4 py-2 m-4 rounded-xl text-gray-600 hover:bg-gray-100 transition"
        onClick={logout}
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </aside>
  );
}
