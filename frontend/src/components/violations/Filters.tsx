// Filters.tsx
export default function Filters() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input type="text" placeholder="Search by plate" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-gray-50" />
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-gray-50">
        <option>Type</option>
      </select>
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-gray-50">
        <option>Severity</option>
      </select>
      <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-gray-50" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Export CSV</button>
    </div>
  );
}
