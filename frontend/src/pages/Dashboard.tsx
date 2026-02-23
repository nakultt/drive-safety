import React from 'react';
import { TrendingUp, AlertTriangle, Zap, Smartphone, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Layout from '../layouts/Layout';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import type { Column } from '../components/DataTable';
import {
  mockDashboardStats,
  mockDailyViolations,
  mockViolationDistribution,
  mockEvents
} from '../data/mockData';
import type { Event } from '../data/mockData';

const Dashboard: React.FC = () => {
  const stats = mockDashboardStats;

  const eventColumns: Column<Event>[] = [
    {
      key: 'eventType',
      label: 'Type',
      render: (value) => (
        <Badge variant={value === 'violation' ? 'error' : value === 'animal-alert' ? 'warning' : 'info'} size="sm">
          <span className="capitalize">{value}</span>
        </Badge>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => <span className="text-sm text-slate-900">{value}</span>
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
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
    }
  ];

  return (
    <Layout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={AlertTriangle}
          title="Total Violations Today"
          value={stats.totalViolations}
          trend={{ value: 12, direction: 'up', timeframe: 'vs yesterday' }}
          backgroundColor="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Helmet Violations"
          value={stats.helmetViolations}
          trend={{ value: 8, direction: 'down' }}
          backgroundColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={Zap}
          title="Overspeed Violations"
          value={stats.overspeedViolations}
          trend={{ value: 15, direction: 'up' }}
          backgroundColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={Smartphone}
          title="Active Devices"
          value={stats.activeDevices}
          trend={{ value: 2, direction: 'down' }}
          backgroundColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart - Violations Trend */}
        <div className="lg:col-span-2">
          <ChartCard title="Daily Violations Trend" description="Last 7 days">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDailyViolations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="violations" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5' }} />
                <Line type="monotone" dataKey="helmets" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                <Line type="monotone" dataKey="overspeeds" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Pie Chart - Violation Distribution */}
        <div>
          <ChartCard title="Violation Distribution" description="Current breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockViolationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockViolationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Live Alerts and Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Live Alerts Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900">Live Alerts</h3>
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                {stats.liveAlerts}
              </span>
            </div>
            <div className="space-y-3">
              {mockEvents
                .filter((event) => event.status === 'pending')
                .slice(0, 4)
                .map((alert) => (
                  <div key={alert.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-red-900">{alert.description}</p>
                    </div>
                    <p className="text-xs text-red-700">{alert.location}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="lg:col-span-2">
          <DataTable
            data={mockEvents.slice(0, 5)}
            columns={eventColumns}
            itemsPerPage={5}
            title="Recent Events"
            searchable={false}
            rowLink={(row) => `/events/${row.id}`}
          />
        </div>
      </div>

      {/* Bar Chart - Location Analysis */}
      <ChartCard title="Violations by Location" description="Top violations by location">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { location: 'M.G. Road', violations: 156 },
            { location: 'Whitefield Road', violations: 142 },
            { location: 'ORR', violations: 134 },
            { location: 'Koramangala', violations: 128 },
            { location: 'Indiranagar', violations: 112 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="location" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="violations" fill="#4f46e5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </Layout>
  );
};

export default Dashboard;
