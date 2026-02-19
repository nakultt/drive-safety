// ViolationFeed.tsx
import Badge from '../common/Badge';
import type { ViolationEvent } from '../../types/event.types';

const severityColor: Record<string, any> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'success',
};

export default function ViolationFeed({ events }: { events: ViolationEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Violations</h3>
        <div className="text-sm text-gray-500">No recent incidents</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Violations</h3>
      <ul className="divide-y divide-gray-100">
        {events.slice(0, 8).map((ev) => (
          <li key={ev.id} className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gray-100 rounded overflow-hidden flex items-center justify-center text-xs text-gray-400">
                {ev.plateImageUrl ? <img src={ev.plateImageUrl} alt="plate" className="w-full h-full object-cover" /> : 'No image'}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-gray-800 text-sm">{ev.plateNumber}</span>
                <span className="text-gray-600 text-sm">{ev.violationType} • {ev.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge color={severityColor[ev.severity]}>{ev.severity}</Badge>
              <div className="text-xs text-gray-400">{new Date(ev.timestamp).toLocaleTimeString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
