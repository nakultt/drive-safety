import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Layout from '../layouts/Layout';
import ChartCard from '../components/ChartCard';
import {
  mockDailyViolations,
  mockViolationDistribution,
  mockLocationAnalysis,
  mockDevicePerformance
} from '../data/mockData';

const Analytics: React.FC = () => {
  return (
    <Layout title="Analytics & Insights">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations Per Day */}
        <ChartCard title="Violations per Day" description="7-day trend analysis">
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
              <Line type="monotone" dataKey="violations" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Location-Based Analysis */}
        <ChartCard title="Violations by Location" description="Top 6 hotspots">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockLocationAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="location" stroke="#64748b" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="violations" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Violation Types Distribution */}
        <ChartCard title="Violation Types Distribution" description="Breakdown by violation category">
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

        {/* Device Performance Comparison */}
        <ChartCard title="Device Performance Comparison" description="Uptime and event detection">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockDevicePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="deviceId" stroke="#64748b" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="uptime" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="events" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium mb-2">Total Violations</p>
          <p className="text-3xl font-bold text-slate-900">1,247</p>
          <p className="text-xs text-green-600 mt-2">↑ 12% increase</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-slate-900">2.3m</p>
          <p className="text-xs text-green-600 mt-2">↓ 5% improvement</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium mb-2">Device Uptime</p>
          <p className="text-3xl font-bold text-slate-900">98.5%</p>
          <p className="text-xs text-green-600 mt-2">5 devices online</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium mb-2">Revenue (Fines)</p>
          <p className="text-3xl font-bold text-slate-900">₹12.4L</p>
          <p className="text-xs text-green-600 mt-2">This month</p>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
