// Navbar.tsx
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/violations': 'Violations',
  '/analytics': 'Analytics',
  '/offenders': 'Offenders',
  '/reports': 'Reports',
  '/heatmap': 'Heatmap',
};

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800">
        {pageTitles[pathname] || 'Smart Traffic Monitoring'}
      </h2>
    </header>
  );
}
