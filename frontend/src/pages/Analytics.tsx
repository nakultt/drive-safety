// Analytics.tsx
import Layout from '../components/layout/Layout';
import PieDistribution from '../components/analytics/PieDistribution';
import SeverityChart from '../components/analytics/SeverityChart';
import LocationBarChart from '../components/analytics/LocationBarChart';

export default function Analytics() {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <PieDistribution />
        <SeverityChart />
        <LocationBarChart />
      </div>
      {/* TODO: Add Top 5 repeat offenders section */}
    </Layout>
  );
}
