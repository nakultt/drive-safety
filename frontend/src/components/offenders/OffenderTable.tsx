// OffenderTable.tsx
import Badge from '../common/Badge';

const offenders = [
  // TODO: Replace with real data
  { id: 1, plate: 'MH12AB1234', total: 5, risk: 92, fine: 5000, last: '2026-02-18', highRisk: true },
  { id: 2, plate: 'DL8CAF4321', total: 3, risk: 70, fine: 3000, last: '2026-02-17', highRisk: false },
];

export default function OffenderTable() {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Plate</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Total Violations</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Risk Score</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Total Fine</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Violation</th>
          </tr>
        </thead>
        <tbody>
          {offenders.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 transition">
              <td className={`px-4 py-2 font-mono ${row.highRisk ? 'text-red-500 font-bold' : 'text-gray-800'}`}>{row.plate}</td>
              <td className="px-4 py-2 text-gray-800">{row.total}</td>
              <td className="px-4 py-2">{row.highRisk ? <Badge color="danger">{row.risk}</Badge> : <Badge color="warning">{row.risk}</Badge>}</td>
              <td className="px-4 py-2 text-gray-800 font-semibold">₹{row.fine}</td>
              <td className="px-4 py-2 text-gray-600">{row.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
