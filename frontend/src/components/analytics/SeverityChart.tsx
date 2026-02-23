// SeverityChart.tsx
const data = [
  { severity: 'High', count: 0 },
  { severity: 'Medium', count: 0 },
  { severity: 'Low', count: 0 },
];

export default function SeverityChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Severity Breakdown</h3>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.severity} className="flex items-center justify-between">
            <div className="text-sm text-gray-700">{d.severity}</div>
            <div className="text-sm font-semibold text-gray-800">{d.count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
