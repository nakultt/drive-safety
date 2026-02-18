// PieDistribution.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2563eb', '#6366f1', '#f59e42', '#ef4444', '#22c55e'];
const data = [
  { name: 'Helmet', value: 0 },
  { name: 'Overspeeding', value: 0 },
  { name: 'Wrong-Side', value: 0 },
  { name: 'Signal Jump', value: 0 },
];

export default function PieDistribution() {
  // TODO: Fetch real data
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Violation Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#2563eb">
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 14 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
