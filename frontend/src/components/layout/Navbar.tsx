// Navbar.tsx
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/violations': 'Violations',
  '/analytics': 'Analytics',
  '/offenders': 'Offenders',
  '/reports': 'Reports',
};

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../services/api';

export default function Navbar() {
  const { pathname } = useLocation();
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE_URL}/api/health`)
      .then((r) => r.json())
      .then(() => mounted && setApiOk(true))
      .catch(() => mounted && setApiOk(false));
    return () => { mounted = false; };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800">{pageTitles[pathname] || 'Smart Traffic Monitoring'}</h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className={`w-3 h-3 rounded-full ${apiOk === null ? 'bg-gray-200' : apiOk ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden />
          <span>{apiOk === null ? 'Checking API...' : apiOk ? 'API OK' : 'API offline'}</span>
        </div>
      </div>
    </header>
  );
}
