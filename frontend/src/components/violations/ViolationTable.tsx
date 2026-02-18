// ViolationTable.tsx
import Badge from '../common/Badge';

const data = [
  // TODO: Replace with real data
  {
    id: 1,
    image: '',
    plate: 'MH12AB1234',
    type: 'Overspeeding',
    location: 'Main St',
    speed: 80,
    severity: 'High',
    fine: 1000,
    repeat: true,
    paid: false,
  },
];

export default function ViolationTable() {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Image</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Plate</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Speed</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Severity</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Fine</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Repeat</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Paid</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2"><div className="w-12 h-8 bg-gray-100 rounded" /></td>
              <td className="px-4 py-2 font-mono text-gray-800">{row.plate}</td>
              <td className="px-4 py-2 text-gray-600">{row.type}</td>
              <td className="px-4 py-2 text-gray-600">{row.location}</td>
              <td className="px-4 py-2 text-gray-600">{row.speed} km/h</td>
              <td className="px-4 py-2"><Badge color={row.severity === 'High' ? 'danger' : row.severity === 'Medium' ? 'warning' : 'success'}>{row.severity}</Badge></td>
              <td className="px-4 py-2 text-gray-800 font-semibold">₹{row.fine}</td>
              <td className="px-4 py-2">{row.repeat && <Badge color="danger">Repeat</Badge>}</td>
              <td className="px-4 py-2">{row.paid ? <Badge color="success">Paid</Badge> : <Badge color="warning">Unpaid</Badge>}</td>
              <td className="px-4 py-2"><button className="text-blue-600 hover:underline">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
