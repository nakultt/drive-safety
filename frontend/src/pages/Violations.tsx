import React from 'react';
import Layout from '../layouts/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import type { Column } from '../components/DataTable';
import { mockViolations } from '../data/mockData';
import type { Violation } from '../data/mockData';

const Violations: React.FC = () => {
  const violationColumns: Column<Violation>[] = [
    {
      key: 'imageUrl',
      label: 'Image',
      render: (value) => (
        <img
          src={value}
          alt="Violation"
          className="w-12 h-12 rounded-lg object-cover"
        />
      ),
      width: '60px'
    },
    {
      key: 'vehicleNumber',
      label: 'Vehicle Number',
      render: (value) => <span className="font-medium text-slate-900">{value}</span>
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge
          variant={value === 'helmet' ? 'error' : value === 'overspeed' ? 'warning' : 'info'}
          size="sm"
        >
          <span className="capitalize">{value}</span>
        </Badge>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
    },
    {
      key: 'time',
      label: 'Time',
      render: (value) => <span className="text-sm text-slate-600">{value}</span>
    },
    {
      key: 'speed',
      label: 'Speed (km/h)',
      render: (value) => {
        if (value === 0) return <span className="text-sm text-slate-600">—</span>;
        return <span className="text-sm font-medium text-slate-900">{value} km/h</span>;
      }
    },
    {
      key: 'fineAmount',
      label: 'Fine Amount',
      render: (value) => <span className="font-semibold text-slate-900">₹{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge
          variant={value === 'paid' ? 'success' : value === 'appealed' ? 'info' : 'warning'}
          size="sm"
        >
          <span className="capitalize">{value}</span>
        </Badge>
      )
    }
  ];

  return (
    <Layout title="Violations Management">
      <div className="grid grid-cols-1 gap-6">
        <DataTable
          data={mockViolations}
          columns={violationColumns}
          itemsPerPage={10}
          title="All Violations"
          searchable={true}
          searchFields={['vehicleNumber', 'location', 'type']}
          filterOptions={[
            {
              label: 'Filter by Type',
              field: 'type',
              options: [
                { label: 'Helmet Violations', value: 'helmet' },
                { label: 'Overspeed', value: 'overspeed' },
                { label: 'Signal Violation', value: 'signal' },
                { label: 'Other', value: 'other' }
              ]
            },
            {
              label: 'Filter by Status',
              field: 'status',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
                { label: 'Appealed', value: 'appealed' }
              ]
            }
          ]}
        />
      </div>
    </Layout>
  );
};

export default Violations;
