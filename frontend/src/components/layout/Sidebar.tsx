// Sidebar.tsx
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
];

export default function Sidebar() {
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
    </aside>
  );
}
