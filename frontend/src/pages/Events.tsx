import React from 'react';
import Layout from '../layouts/Layout';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import type { Column } from '../components/DataTable';
import { mockEvents } from '../data/mockData';
import type { Event } from '../data/mockData';

const Events: React.FC = () => {
  const eventColumns: Column<Event>[] = [
    {
      key: 'eventType',
      label: 'Type',
      render: (value) => {
        const variantMap: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
          violation: 'error',
          distraction: 'warning',
          pothole: 'info',
          'animal-alert': 'warning',
          'device-error': 'error'
        };
        return (
          <Badge variant={variantMap[value] || 'default'} size="sm">
            <span className="capitalize">{value}</span>
          </Badge>
        );
      }
    },
    {
      key: 'vehicleNumber',
      label: 'Vehicle',
      render: (value) => <span className="font-medium text-slate-900">{value || '—'}</span>
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => <span className="text-sm text-slate-600">{value}</span>
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => {
        const date = new Date(value);
        return <span className="text-sm text-slate-600">{date.toLocaleTimeString()}</span>;
      }
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => (
        <Badge
          variant={value === 'high' ? 'error' : value === 'medium' ? 'warning' : 'info'}
          size="sm"
        >
          <span className="capitalize">{value}</span>
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge
          variant={value === 'resolved' ? 'success' : value === 'in-progress' ? 'warning' : 'info'}
          size="sm"
        >
          <span className="capitalize">{value}</span>
        </Badge>
      )
    }
  ];

  return (
    <Layout title="Event Log">
      <DataTable
        data={mockEvents}
        columns={eventColumns}
        itemsPerPage={15}
        title="All Events"
        searchable={true}
        searchFields={['vehicleNumber', 'description', 'location']}
        filterOptions={[
          {
            label: 'Filter by Type',
            field: 'eventType',
            options: [
              { label: 'Violations', value: 'violation' },
              { label: 'Distractions', value: 'distraction' },
              { label: 'Potholes', value: 'pothole' },
              { label: 'Animal Alerts', value: 'animal-alert' },
              { label: 'Device Errors', value: 'device-error' }
            ]
          },
          {
            label: 'Filter by Status',
            field: 'status',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Resolved', value: 'resolved' }
            ]
          }
        ]}
        rowLink={(row) => `/events/${row.id}`}
      />
    </Layout>
  );
};

export default Events;
