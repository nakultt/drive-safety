import React, { useState } from 'react';
import Layout from '../layouts/Layout';
import {
  Bell,
  Camera,
  Shield,
  Smartphone,
  Zap,
  User,
  Save,
  ToggleRight
} from 'lucide-react';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile Settings
    fullName: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+91 98765 43210',
    role: 'System Administrator',

    // Notification Settings
    emailAlerts: true,
    pushNotifications: true,
    violationAlerts: true,
    maintenanceAlerts: false,
    weeklyReports: true,

    // Camera Settings
    resolution: 'high',
    frameRate: '30fps',
    nightVision: true,
    enableRecording: true,
    storageLimit: '500GB',

    // Alert Thresholds
    speedLimit: '40',
    distractionTimeout: '15',
    potholeDepth: '3',
    animalDetectionConfidence: '0.8',

    // System Settings
    darkMode: false,
    soundEnabled: true,
    location: 'Bangalore',
    timezone: 'IST (UTC+5:30)'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const sections: SettingSection[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'camera', label: 'Camera & Sensors', icon: <Camera className="w-5 h-5" /> },
    { id: 'thresholds', label: 'Alert Thresholds', icon: <Zap className="w-5 h-5" /> },
    { id: 'system', label: 'System', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> }
  ];

  return (
    <Layout title="Settings">
      <div className="min-h-screen bg-slate-50 pt-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your preferences and system configuration</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
              {/* Settings Tabs */}
              <div className="bg-slate-50 border-r border-slate-100 p-4 lg:max-h-screen overflow-y-auto">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium text-sm">{section.label}</span>
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3 p-8">
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Settings</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={settings.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                          <select
                            value={settings.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option>System Administrator</option>
                            <option>Manager</option>
                            <option>Operator</option>
                            <option>Viewer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Email Alerts</p>
                            <p className="text-sm text-slate-600">Receive notifications via email</p>
                          </div>
                          <button
                            onClick={() => handleToggle('emailAlerts')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.emailAlerts ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.emailAlerts ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Push Notifications</p>
                            <p className="text-sm text-slate-600">Receive push notifications on your device</p>
                          </div>
                          <button
                            onClick={() => handleToggle('pushNotifications')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.pushNotifications ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.pushNotifications ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Violation Alerts</p>
                            <p className="text-sm text-slate-600">Alert for traffic violations detected</p>
                          </div>
                          <button
                            onClick={() => handleToggle('violationAlerts')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.violationAlerts ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.violationAlerts ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Maintenance Alerts</p>
                            <p className="text-sm text-slate-600">Alert for system maintenance notifications</p>
                          </div>
                          <button
                            onClick={() => handleToggle('maintenanceAlerts')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.maintenanceAlerts ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.maintenanceAlerts ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Weekly Reports</p>
                            <p className="text-sm text-slate-600">Receive weekly summary reports</p>
                          </div>
                          <button
                            onClick={() => handleToggle('weeklyReports')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.weeklyReports ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.weeklyReports ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'camera' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Camera & Sensors Configuration</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Video Resolution</label>
                          <select
                            value={settings.resolution}
                            onChange={(e) => handleInputChange('resolution', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="low">Low (480p)</option>
                            <option value="medium">Medium (720p)</option>
                            <option value="high">High (1080p)</option>
                            <option value="ultra">Ultra (4K)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Frame Rate</label>
                          <select
                            value={settings.frameRate}
                            onChange={(e) => handleInputChange('frameRate', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="24fps">24 FPS</option>
                            <option value="30fps">30 FPS</option>
                            <option value="60fps">60 FPS</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Night Vision</p>
                            <p className="text-sm text-slate-600">Enable infrared night vision mode</p>
                          </div>
                          <button
                            onClick={() => handleToggle('nightVision')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.nightVision ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.nightVision ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Video Recording</p>
                            <p className="text-sm text-slate-600">Enable continuous video recording</p>
                          </div>
                          <button
                            onClick={() => handleToggle('enableRecording')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.enableRecording ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.enableRecording ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Storage Limit</label>
                          <input
                            type="text"
                            value={settings.storageLimit}
                            onChange={(e) => handleInputChange('storageLimit', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 500GB"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'thresholds' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Alert Thresholds</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Speed Limit Threshold (km/h)
                          </label>
                          <input
                            type="number"
                            value={settings.speedLimit}
                            onChange={(e) => handleInputChange('speedLimit', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="40"
                          />
                          <p className="text-xs text-slate-500 mt-1">Trigger alert when speed exceeds this value</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Distraction Detection Timeout (seconds)
                          </label>
                          <input
                            type="number"
                            value={settings.distractionTimeout}
                            onChange={(e) => handleInputChange('distractionTimeout', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="15"
                          />
                          <p className="text-xs text-slate-500 mt-1">Alert if driver is distracted for more than this duration</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Pothole Depth Detection (cm)
                          </label>
                          <input
                            type="number"
                            value={settings.potholeDepth}
                            onChange={(e) => handleInputChange('potholeDepth', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="3"
                          />
                          <p className="text-xs text-slate-500 mt-1">Alert for potholes deeper than this threshold</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Animal Detection Confidence (0.0 - 1.0)
                          </label>
                          <input
                            type="number"
                            value={settings.animalDetectionConfidence}
                            onChange={(e) => handleInputChange('animalDetectionConfidence', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.8"
                            min="0"
                            max="1"
                            step="0.01"
                          />
                          <p className="text-xs text-slate-500 mt-1">Minimum confidence level for animal detection alerts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'system' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">System Settings</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Dark Mode</p>
                            <p className="text-sm text-slate-600">Enable dark theme for the interface</p>
                          </div>
                          <button
                            onClick={() => handleToggle('darkMode')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.darkMode ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.darkMode ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">Sound Enabled</p>
                            <p className="text-sm text-slate-600">Play audio alerts for critical events</p>
                          </div>
                          <button
                            onClick={() => handleToggle('soundEnabled')}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.soundEnabled ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                          >
                            <ToggleRight className={`w-6 h-6 ${
                              settings.soundEnabled ? 'text-green-600' : 'text-slate-400'
                            }`} />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={settings.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
                            <option value="UTC (UTC+0:00)">UTC (UTC+0:00)</option>
                            <option value="EST (UTC-5:00)">EST (UTC-5:00)</option>
                            <option value="PST (UTC-8:00)">PST (UTC-8:00)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Security Settings</h2>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">Two-Factor Authentication is currently <strong>Enabled</strong></p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="font-medium text-slate-900 mb-2">Change Password</p>
                          <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                            Change Password
                          </button>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="font-medium text-slate-900 mb-2">Active Sessions</p>
                          <p className="text-sm text-slate-600 mb-3">You have 2 active sessions</p>
                          <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200">
                            Logout All Other Sessions
                          </button>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="font-medium text-slate-900 mb-2">Data Backup</p>
                          <p className="text-sm text-slate-600 mb-3">Last backup: 2 hours ago</p>
                          <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                            Backup Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      isSaving
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
