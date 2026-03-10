import Layout from '../components/layout/Layout';
import OffenderTable from '../components/offenders/OffenderTable';

export default function Offenders() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Repeat Offenders</h2>
        <OffenderTable />
      </div>
    </Layout>
  );
}
