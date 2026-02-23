import React, { useState } from 'react';
import Layout from '../layouts/Layout';
import {
  Download,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  MapPin,
  Printer
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Report: React.FC = () => {
  const [reportType, setReportType] = useState('violations');
  const [dateRange, setDateRange] = useState('week');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'violations', label: 'Violations Report', icon: AlertTriangle },
    { id: 'performance', label: 'Performance Report', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics Report', icon: BarChart3 },
    { id: 'device', label: 'Device Status Report', icon: Printer }
  ];

  // Sample data for reports
  const violationData = [
    { date: 'Mon', violations: 12, finesCollected: 6000 },
    { date: 'Tue', violations: 19, finesCollected: 9500 },
    { date: 'Wed', violations: 15, finesCollected: 7500 },
    { date: 'Thu', violations: 22, finesCollected: 11000 },
    { date: 'Fri', violations: 18, finesCollected: 9000 },
    { date: 'Sat', violations: 25, finesCollected: 12500 },
    { date: 'Sun', violations: 14, finesCollected: 7000 }
  ];

  const violationTypeData = [
    { name: 'Helmet', value: 45, color: '#6366f1' },
    { name: 'Overspeed', value: 30, color: '#ec4899' },
    { name: 'Signal', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 10, color: '#8b5cf6' }
  ];

  const performanceData = [
    { metric: 'Detection Accuracy', value: 94.2, target: 95 },
    { metric: 'System Uptime', value: 99.8, target: 99.5 },
    { metric: 'Response Time', value: 1.2, target: 2 },
    { metric: 'Alerts Processed', value: 2847, target: 3000 }
  ];

  const topViolationLocations = [
    { location: 'M.G. Road', count: 34, percentage: 18 },
    { location: 'Whitefield Road', count: 28, percentage: 15 },
    { location: 'Indranagar', count: 26, percentage: 14 },
    { location: 'Silk Board Junction', count: 23, percentage: 12 },
    { location: 'BTM Layout', count: 21, percentage: 11 }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let fileContent = '';
      let fileName = '';
      let mimeType = 'text/plain';

      // Generate report content based on type and format
      if (reportType === 'violations') {
        if (exportFormat === 'json') {
          const reportData = {
            reportType: 'Violations Report',
            dateRange,
            generatedDate: new Date().toISOString(),
            summary: {
              totalViolations: 145,
              finesCollected: 72500,
              pendingCases: 34,
              hotspots: 12
            },
            violationTrend: violationData,
            violationsByType: violationTypeData,
            topLocations: topViolationLocations
          };
          fileContent = JSON.stringify(reportData, null, 2);
          mimeType = 'application/json';
          fileName = `violations-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
        } else if (exportFormat === 'csv') {
          let csv = 'Violations Report\n';
          csv += `Generated: ${new Date().toLocaleString()}\n`;
          csv += `Date Range: ${dateRange}\n\n`;
          csv += 'Summary\n';
          csv += 'Metric,Value\n';
          csv += 'Total Violations,145\n';
          csv += 'Fines Collected,₹72500\n';
          csv += 'Pending Cases,34\n';
          csv += 'Hotspots,12\n\n';
          csv += 'Daily Violations Trend\n';
          csv += 'Date,Violations,Fines Collected\n';
          violationData.forEach(d => {
            csv += `${d.date},${d.violations},${d.finesCollected}\n`;
          });
          csv += '\nTop Violation Locations\n';
          csv += 'Location,Count,Percentage\n';
          topViolationLocations.forEach(l => {
            csv += `${l.location},${l.count},${l.percentage}%\n`;
          });
          fileContent = csv;
          mimeType = 'text/csv';
          fileName = `violations-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        } else if (exportFormat === 'excel') {
          let csv = 'Violations Report\n';
          csv += `Generated: ${new Date().toLocaleString()}\n`;
          csv += `Date Range: ${dateRange}\n\n`;
          csv += 'Summary\n';
          csv += 'Metric\tValue\n';
          csv += 'Total Violations\t145\n';
          csv += 'Fines Collected\t₹72500\n';
          csv += 'Pending Cases\t34\n';
          csv += 'Hotspots\t12\n\n';
          csv += 'Daily Violations Trend\n';
          csv += 'Date\tViolations\tFines Collected\n';
          violationData.forEach(d => {
            csv += `${d.date}\t${d.violations}\t${d.finesCollected}\n`;
          });
          fileContent = csv;
          mimeType = 'application/vnd.ms-excel';
          fileName = `violations-report-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
        } else {
          // PDF - create a text representation
          fileContent = `VIOLATIONS REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${dateRange}

SUMMARY
Total Violations: 145
Fines Collected: ₹72,500
Pending Cases: 34
Traffic Hotspots: 12

VIOLATIONS TREND (by day)`;
          violationData.forEach(d => {
            fileContent += `\n${d.date}: ${d.violations} violations, ₹${d.finesCollected.toLocaleString()} collected`;
          });
          fileContent += '\n\nTOP VIOLATION LOCATIONS';
          topViolationLocations.forEach((l, i) => {
            fileContent += `\n${i + 1}. ${l.location}: ${l.count} violations (${l.percentage}%)`;
          });
          mimeType = 'application/pdf';
          fileName = `violations-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
        }
      } else if (reportType === 'performance') {
        if (exportFormat === 'json') {
          const reportData = {
            reportType: 'Performance Report',
            dateRange,
            generatedDate: new Date().toISOString(),
            metrics: performanceData
          };
          fileContent = JSON.stringify(reportData, null, 2);
          mimeType = 'application/json';
          fileName = `performance-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
        } else {
          let csv = 'Performance Report\n';
          csv += `Generated: ${new Date().toLocaleString()}\n\n`;
          csv += 'Metric,Value,Target,Status\n';
          performanceData.forEach(m => {
            const status = m.value >= m.target ? 'PASS' : 'FAIL';
            csv += `${m.metric},${m.value},${m.target},${status}\n`;
          });
          fileContent = csv;
          mimeType = 'text/csv';
          fileName = `performance-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        }
      } else if (reportType === 'analytics') {
        const reportData = {
          reportType: 'Analytics Report',
          dateRange,
          generatedDate: new Date().toISOString(),
          insights: {
            dataPointsAnalyzed: 2400000,
            patternsDetected: 87,
            predictiveAccuracy: '91.2%'
          },
          dailyData: violationData
        };
        fileContent = JSON.stringify(reportData, null, 2);
        mimeType = 'application/json';
        fileName = `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
      } else if (reportType === 'device') {
        let csv = 'Device Status Report\n';
        csv += `Generated: ${new Date().toLocaleString()}\n\n`;
        csv += 'Device Status Summary\n';
        csv += 'Metric,Value\n';
        csv += 'Active Devices,24 of 25\n';
        csv += 'Operational Status,96%\n';
        csv += 'Devices Offline,1\n';
        csv += 'Storage Utilization,78%\n';
        csv += 'Average Uptime,99.2%\n';
        fileContent = csv;
        mimeType = 'text/csv';
        fileName = `device-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      }

      // Create blob and trigger download
      const blob = new Blob([fileContent], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Layout title="Reports">
      <div className="min-h-screen bg-slate-50 pt-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports</h1>
            <p className="text-slate-600">Generate and analyze comprehensive reports on system performance and violations</p>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className={`w-full px-6 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isGenerating
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Generate & Download'}
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-8">
            {reportType === 'violations' && (
              <>
                {/* Violations Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Violations</p>
                        <p className="text-3xl font-bold text-slate-900">145</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-4 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +12% from last week
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Fines Collected</p>
                        <p className="text-3xl font-bold text-slate-900">₹72.5K</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-4 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +8% from last week
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Pending Cases</p>
                        <p className="text-3xl font-bold text-slate-900">34</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-xs text-red-600 mt-4 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +5% from last week
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Hotspots</p>
                        <p className="text-3xl font-bold text-slate-900">12</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-4">High violation zones identified</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Violations Trend */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Violations Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={violationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="violations"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ fill: '#6366f1', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Violations by Type */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Violations by Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={violationTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {violationTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Violation Locations */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Top Violation Hotspots</h3>
                  <div className="space-y-4">
                    {topViolationLocations.map((location, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-slate-900">{location.location}</p>
                            <p className="text-sm text-slate-600">{location.count} violations</p>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${(location.count / topViolationLocations[0].count) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{location.percentage}% of total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {reportType === 'performance' && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">System Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {performanceData.map((item, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-medium text-slate-900">{item.metric}</p>
                          <p className={`text-lg font-bold ${item.value >= item.target ? 'text-green-600' : 'text-red-600'}`}>
                            {item.value}{item.metric.includes('Time') ? 's' : item.metric.includes('Accuracy') ? '%' : ''}
                          </p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.value >= item.target ? 'bg-green-600' : 'bg-red-600'}`}
                            style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Target: {item.target}{item.metric.includes('Time') ? 's' : item.metric.includes('Accuracy') ? '%' : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={violationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="finesCollected" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {reportType === 'analytics' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Advanced Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-1">Data Points Analyzed</p>
                    <p className="text-2xl font-bold text-blue-600">2.4M</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900 font-medium mb-1">Patterns Detected</p>
                    <p className="text-2xl font-bold text-purple-600">87</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-900 font-medium mb-1">Predictive Accuracy</p>
                    <p className="text-2xl font-bold text-orange-600">91.2%</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={violationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="violations" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {reportType === 'device' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h3 className="font-bold text-green-900 mb-4">Active Devices</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">24/25</p>
                  <p className="text-sm text-green-700">96% operational status</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                  <h3 className="font-bold text-yellow-900 mb-4">Devices Offline</h3>
                  <p className="text-3xl font-bold text-yellow-600 mb-2">1</p>
                  <p className="text-sm text-yellow-700">Maintenance in progress</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="font-bold text-blue-900 mb-4">Storage Utilization</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">78%</p>
                  <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                  <h3 className="font-bold text-purple-900 mb-4">Average Uptime</h3>
                  <p className="text-3xl font-bold text-purple-600 mb-2">99.2%</p>
                  <p className="text-sm text-purple-700">Last 30 days</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;
