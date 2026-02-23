import SummaryCard from './SummaryCard';
import type { ViolationEvent } from '../../types/event.types';

export default function SummarySection({ events }: { events?: ViolationEvent[] | null }) {
  // ✅ Ensure events is always an array
  const safeEvents = Array.isArray(events) ? events : [];

  const total = safeEvents.length;
  const helmet = safeEvents.filter((e) => e.violationType.toLowerCase().includes('helmet')).length;
  const wrongSide = safeEvents.filter((e) => e.violationType.toLowerCase().includes('wrong') || e.violationType.toLowerCase().includes('wrong-side')).length;
  const overspeed = safeEvents.filter((e) => e.violationType.toLowerCase().includes('speed') || e.violationType.toLowerCase().includes('overspeed')).length;
  const repeat = safeEvents.filter((e) => e.isRepeatOffender).length;

  const summaryData = [
    { icon: <span className="text-xl">⚠️</span>, label: 'Total Violations', value: total, color: 'bg-blue-600' },
    { icon: <span className="text-xl">🛡️</span>, label: 'Helmet Violations', value: helmet, color: 'bg-indigo-500' },
    { icon: <span className="text-xl">↗️</span>, label: 'Wrong-Side Driving', value: wrongSide, color: 'bg-yellow-500' },
    { icon: <span className="text-xl">⚡</span>, label: 'Overspeeding', value: overspeed, color: 'bg-red-500' },
    { icon: <span className="text-xl">🔁</span>, label: 'Repeat Offenders', value: repeat, color: 'bg-green-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      {summaryData.map((item, idx) => (
        <SummaryCard key={idx} {...item} />
      ))}
    </div>
  );
}
