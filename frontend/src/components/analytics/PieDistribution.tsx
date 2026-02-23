// PieDistribution.tsx
const COLORS = ['#2563eb', '#6366f1', '#f59e42', '#ef4444', '#22c55e'];
const data = [
  { name: 'Helmet', value: 0 },
  { name: 'Overspeeding', value: 0 },
  { name: 'Wrong-Side', value: 0 },
  { name: 'Signal Jump', value: 0 },
];

export default function PieDistribution() {
  // Dependency-free summary view for distribution
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Violation Distribution</h3>
      <div className="grid grid-cols-2 gap-3">
        {data.map((d, idx) => (
          <div key={d.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
            <div className="flex-1 text-sm text-gray-700">{d.name}</div>
            <div className="text-sm font-semibold text-gray-800">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
