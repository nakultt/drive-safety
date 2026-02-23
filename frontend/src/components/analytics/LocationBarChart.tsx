// LocationBarChart.tsx
const data = [
  { location: 'Main St', count: 0 },
  { location: '2nd Ave', count: 0 },
  { location: 'Ring Rd', count: 0 },
];

export default function LocationBarChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Analysis</h3>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.location} className="flex justify-between text-sm text-gray-700">
            <span>{d.location}</span>
            <span className="font-semibold text-gray-800">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
