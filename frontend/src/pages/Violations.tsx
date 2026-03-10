// Violations.tsx
import Layout from '../components/layout/Layout';
import Filters from '../components/violations/Filters';
import ViolationTable from '../components/violations/ViolationTable';

export default function Violations() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <Filters />
        <ViolationTable />
      </div>
    </Layout>
  );
}
