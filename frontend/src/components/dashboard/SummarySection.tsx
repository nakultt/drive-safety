// SummarySection.tsx
import { LucideShield, LucideAlertTriangle, LucideArrowUpRight, LucideRepeat, LucideActivity } from 'lucide-react';
import SummaryCard from './SummaryCard';
import { ViolationEvent } from '../../types/event.types';

export default function SummarySection({ events }: { events: ViolationEvent[] }) {
  const total = events.length;
  const helmet = events.filter((e) => e.violationType.toLowerCase().includes('helmet')).length;
  const wrongSide = events.filter((e) => e.violationType.toLowerCase().includes('wrong') || e.violationType.toLowerCase().includes('wrong-side')).length;
  const overspeed = events.filter((e) => e.violationType.toLowerCase().includes('speed') || e.violationType.toLowerCase().includes('overspeed')).length;
  const repeat = events.filter((e) => e.isRepeatOffender).length;

  const summaryData = [
    { icon: <LucideAlertTriangle />, label: 'Total Violations', value: total, color: 'bg-blue-600' },
    { icon: <LucideShield />, label: 'Helmet Violations', value: helmet, color: 'bg-indigo-500' },
    { icon: <LucideArrowUpRight />, label: 'Wrong-Side Driving', value: wrongSide, color: 'bg-yellow-500' },
    { icon: <LucideActivity />, label: 'Overspeeding', value: overspeed, color: 'bg-red-500' },
    { icon: <LucideRepeat />, label: 'Repeat Offenders', value: repeat, color: 'bg-green-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      {summaryData.map((item, idx) => (
        <SummaryCard key={idx} {...item} />
      ))}
    </div>
  );
}
