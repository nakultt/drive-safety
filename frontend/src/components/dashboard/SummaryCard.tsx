// SummaryCard.tsx
import type { ReactNode } from 'react';

interface SummaryCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: string;
}

export default function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 p-6 min-w-[180px]">
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-white text-2xl ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
      </div>
    </div>
  );
}
