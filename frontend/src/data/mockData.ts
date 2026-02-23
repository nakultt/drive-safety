// ==================== TYPE DEFINITIONS ====================

export interface Violation {
  id: string;
  vehicleNumber: string;
  type: 'helmet' | 'overspeed' | 'signal' | 'other';
  location: string;
  time: string;
  speed: number;
  speedLimit: number;
  fineAmount: number;
  status: 'pending' | 'paid' | 'appealed';
  imageUrl: string;
  timestamp: string;
}

export interface Distraction {
  id: string;
  vehicleNumber: string;
  driverId: string;
  phoneDetected: boolean;
  duration: number;
  timestamp: string;
  imageUrl: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Pothole {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  imageUrl: string;
  detectedTime: string;
  reportedTime?: string;
  status: 'reported' | 'fixed' | 'pending';
  reportId?: string;
}

export interface AnimalAlert {
  id: string;
  animalType: string;
  location: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  alertTime: string;
  alertStatus: 'active' | 'cleared' | 'false-positive';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Event {
  id: string;
  eventType: 'violation' | 'distraction' | 'pothole' | 'animal-alert' | 'device-error';
  vehicleNumber?: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'in-progress';
  imageUrl?: string;
  details: Record<string, string | number>;
}

export interface Device {
  id: string;
  deviceId: string;
  location: string;
  status: 'online' | 'offline';
  lastActiveTime: string;
  totalEventsDetected: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  firmwareVersion: string;
}

export interface DashboardStats {
  totalViolations: number;
  helmetViolations: number;
  overspeedViolations: number;
  activeDevices: number;
  liveAlerts: number;
  averageResponseTime: string;
}

// ==================== MOCK DATA ====================

export const mockViolations: Violation[] = [
  {
    id: '1',
    vehicleNumber: 'MH02AB1234',
    type: 'helmet',
    location: 'M.G. Road, Bangalore',
    time: '14:32',
    speed: 0,
    speedLimit: 0,
    fineAmount: 500,
    status: 'pending',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    timestamp: '2026-02-23T14:32:00Z'
  },
  {
    id: '2',
    vehicleNumber: 'MH02CD5678',
    type: 'overspeed',
    location: 'Indiranagar, Bangalore',
    time: '13:15',
    speed: 65,
    speedLimit: 40,
    fineAmount: 1000,
    status: 'paid',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    timestamp: '2026-02-23T13:15:00Z'
  },
  {
    id: '3',
    vehicleNumber: 'MH02EF9012',
    type: 'helmet',
    location: 'Whitefield, Bangalore',
    time: '12:45',
    speed: 0,
    speedLimit: 0,
    fineAmount: 500,
    status: 'appealed',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    timestamp: '2026-02-23T12:45:00Z'
  },
  {
    id: '4',
    vehicleNumber: 'MH02GH3456',
    type: 'signal',
    location: 'Koramangala, Bangalore',
    time: '11:20',
    speed: 0,
    speedLimit: 0,
    fineAmount: 3000,
    status: 'pending',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    timestamp: '2026-02-23T11:20:00Z'
  },
  {
    id: '5',
    vehicleNumber: 'MH02IJ7890',
    type: 'overspeed',
    location: 'Jayanagar, Bangalore',
    time: '10:05',
    speed: 62,
    speedLimit: 40,
    fineAmount: 1000,
    status: 'pending',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    timestamp: '2026-02-23T10:05:00Z'
  },
  {
    id: '6',
    vehicleNumber: 'MH02KL2345',
    type: 'helmet',
    location: 'Marathahalli, Bangalore',
    time: '09:30',
    speed: 0,
    speedLimit: 0,
    fineAmount: 500,
    status: 'paid',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    timestamp: '2026-02-23T09:30:00Z'
  },
  {
    id: '7',
    vehicleNumber: 'MH02MN6789',
    type: 'overspeed',
    location: 'BTM Layout, Bangalore',
    time: '08:15',
    speed: 58,
    speedLimit: 40,
    fineAmount: 1000,
    status: 'pending',
    imageUrl: 'https://picsum.photos/400/300?random=7',
    timestamp: '2026-02-23T08:15:00Z'
  }
];

export const mockDistractions: Distraction[] = [
  {
    id: 'D1',
    vehicleNumber: 'MH02AB1234',
    driverId: 'DRV001',
    phoneDetected: true,
    duration: 45,
    timestamp: '2026-02-23T14:32:00Z',
    imageUrl: 'https://picsum.photos/400/300?random=10',
    severity: 'high'
  },
  {
    id: 'D2',
    vehicleNumber: 'MH02CD5678',
    driverId: 'DRV002',
    phoneDetected: true,
    duration: 32,
    timestamp: '2026-02-23T13:45:00Z',
    imageUrl: 'https://picsum.photos/400/300?random=11',
    severity: 'high'
  },
  {
    id: 'D3',
    vehicleNumber: 'MH02EF9012',
    driverId: 'DRV003',
    phoneDetected: false,
    duration: 15,
    timestamp: '2026-02-23T12:30:00Z',
    imageUrl: 'https://picsum.photos/400/300?random=12',
    severity: 'low'
  },
  {
    id: 'D4',
    vehicleNumber: 'MH02GH3456',
    driverId: 'DRV004',
    phoneDetected: true,
    duration: 28,
    timestamp: '2026-02-23T11:15:00Z',
    imageUrl: 'https://picsum.photos/400/300?random=13',
    severity: 'medium'
  }
];

export const mockPotholes: Pothole[] = [
  {
    id: 'P1',
    location: 'M.G. Road, Near Forum Mall',
    latitude: 12.9352,
    longitude: 77.6245,
    severity: 'high',
    imageUrl: 'https://picsum.photos/400/300?random=20',
    detectedTime: '2026-02-23T10:20:00Z',
    reportedTime: '2026-02-23T10:25:00Z',
    status: 'reported',
    reportId: 'RPT001'
  },
  {
    id: 'P2',
    location: 'Whitefield Main Road',
    latitude: 12.9698,
    longitude: 77.7499,
    severity: 'medium',
    imageUrl: 'https://picsum.photos/400/300?random=21',
    detectedTime: '2026-02-23T08:45:00Z',
    reportedTime: '2026-02-23T08:50:00Z',
    status: 'fixed',
    reportId: 'RPT002'
  },
  {
    id: 'P3',
    location: 'Koramangala Commercial Street',
    latitude: 12.9352,
    longitude: 77.6245,
    severity: 'low',
    imageUrl: 'https://picsum.photos/400/300?random=22',
    detectedTime: '2026-02-23T07:15:00Z',
    status: 'pending'
  },
  {
    id: 'P4',
    location: 'Indiranagar 100 Feet Road',
    latitude: 12.9716,
    longitude: 77.6412,
    severity: 'high',
    imageUrl: 'https://picsum.photos/400/300?random=23',
    detectedTime: '2026-02-23T06:30:00Z',
    reportedTime: '2026-02-23T06:35:00Z',
    status: 'reported',
    reportId: 'RPT003'
  }
];

export const mockAnimalAlerts: AnimalAlert[] = [
  {
    id: 'A1',
    animalType: 'Cow',
    location: 'Outer Ring Road',
    latitude: 12.9,
    longitude: 77.65,
    imageUrl: 'https://picsum.photos/400/300?random=30',
    alertTime: '2026-02-23T14:30:00Z',
    alertStatus: 'active',
    riskLevel: 'high'
  },
  {
    id: 'A2',
    animalType: 'Dog',
    location: 'Silk Board Junction',
    latitude: 12.9352,
    longitude: 77.6245,
    imageUrl: 'https://picsum.photos/400/300?random=31',
    alertTime: '2026-02-23T13:15:00Z',
    alertStatus: 'cleared',
    riskLevel: 'medium'
  },
  {
    id: 'A3',
    animalType: 'Bird',
    location: 'Hosur Road',
    latitude: 12.9688,
    longitude: 77.6297,
    imageUrl: 'https://picsum.photos/400/300?random=32',
    alertTime: '2026-02-23T12:00:00Z',
    alertStatus: 'false-positive',
    riskLevel: 'low'
  },
  {
    id: 'A4',
    animalType: 'Deer',
    location: 'ORR Near Sarjapur',
    latitude: 12.8841,
    longitude: 77.6597,
    imageUrl: 'https://picsum.photos/400/300?random=33',
    alertTime: '2026-02-23T10:45:00Z',
    alertStatus: 'active',
    riskLevel: 'high'
  }
];

export const mockEvents: Event[] = [
  {
    id: 'E001',
    eventType: 'violation',
    vehicleNumber: 'MH02AB1234',
    description: 'Helmet violation detected',
    location: 'M.G. Road, Bangalore',
    timestamp: '2026-02-23T14:32:00Z',
    severity: 'medium',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1578892994010-1673f1c408a9?w=400&h=300&fit=crop',
    details: { fine: 500, violationType: 'helmet' }
  },
  {
    id: 'E002',
    eventType: 'violation',
    vehicleNumber: 'MH02CD5678',
    description: 'Overspeed violation - 65 km/h in 40 km/h zone',
    location: 'Indiranagar, Bangalore',
    timestamp: '2026-02-23T13:15:00Z',
    severity: 'high',
    status: 'resolved',
    imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
    details: { speed: 65, speedLimit: 40, fine: 1000 }
  },
  {
    id: 'E003',
    eventType: 'distraction',
    vehicleNumber: 'MH02EF9012',
    description: 'Phone usage detected - 45 seconds',
    location: 'Whitefield, Bangalore',
    timestamp: '2026-02-23T12:45:00Z',
    severity: 'high',
    status: 'in-progress',
    imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
    details: { duration: 45, type: 'phone' }
  },
  {
    id: 'E004',
    eventType: 'pothole',
    description: 'High severity pothole detected',
    location: 'M.G. Road, Near Forum Mall',
    timestamp: '2026-02-23T10:20:00Z',
    severity: 'medium',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1581092916550-e323c3e8c1a4?w=400&h=300&fit=crop',
    details: { severity: 'high', reportId: 'RPT001' }
  },
  {
    id: 'E005',
    eventType: 'animal-alert',
    description: 'Cow detected on roadway',
    location: 'Outer Ring Road',
    timestamp: '2026-02-23T14:30:00Z',
    severity: 'high',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    details: { animal: 'Cow', riskLevel: 'high' }
  },
  {
    id: 'E006',
    eventType: 'device-error',
    description: 'Device offline - communication lost',
    location: 'Koramangala',
    timestamp: '2026-02-23T09:15:00Z',
    severity: 'medium',
    status: 'in-progress',
    details: { deviceId: 'DEV005', reason: 'No signal' }
  }
];

export const mockDevices: Device[] = [
  {
    id: 'D001',
    deviceId: 'CAM-BNG-001',
    location: 'M.G. Road Junction',
    status: 'online',
    lastActiveTime: '2 minutes ago',
    totalEventsDetected: 1256,
    cpuUsage: 45,
    memoryUsage: 62,
    uptime: 98.5,
    firmwareVersion: '2.1.0'
  },
  {
    id: 'D002',
    deviceId: 'CAM-BNG-002',
    location: 'Whitefield Main Road',
    status: 'online',
    lastActiveTime: '5 minutes ago',
    totalEventsDetected: 892,
    cpuUsage: 38,
    memoryUsage: 55,
    uptime: 99.2,
    firmwareVersion: '2.1.0'
  },
  {
    id: 'D003',
    deviceId: 'CAM-BNG-003',
    location: 'Indiranagar 100 Feet Road',
    status: 'offline',
    lastActiveTime: '2 hours ago',
    totalEventsDetected: 734,
    cpuUsage: 0,
    memoryUsage: 0,
    uptime: 0,
    firmwareVersion: '2.0.9'
  },
  {
    id: 'D004',
    deviceId: 'CAM-BNG-004',
    location: 'Koramangala Commercial Street',
    status: 'online',
    lastActiveTime: '1 minute ago',
    totalEventsDetected: 1543,
    cpuUsage: 52,
    memoryUsage: 68,
    uptime: 97.9,
    firmwareVersion: '2.1.0'
  },
  {
    id: 'D005',
    deviceId: 'CAM-BNG-005',
    location: 'Silk Board Junction',
    status: 'online',
    lastActiveTime: '3 minutes ago',
    totalEventsDetected: 967,
    cpuUsage: 41,
    memoryUsage: 59,
    uptime: 98.8,
    firmwareVersion: '2.1.0'
  },
  {
    id: 'D006',
    deviceId: 'CAM-BNG-006',
    location: 'ORR Near Sarjapur',
    status: 'online',
    lastActiveTime: '1 minute ago',
    totalEventsDetected: 1123,
    cpuUsage: 48,
    memoryUsage: 64,
    uptime: 98.2,
    firmwareVersion: '2.1.0'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalViolations: 1247,
  helmetViolations: 456,
  overspeedViolations: 523,
  activeDevices: 5,
  liveAlerts: 3,
  averageResponseTime: '2.3 minutes'
};

// Daily violation trend data for charts
export const mockDailyViolations = [
  { date: 'Feb 16', violations: 45, helmets: 12, overspeeds: 18, signals: 15 },
  { date: 'Feb 17', violations: 52, helmets: 18, overspeeds: 22, signals: 12 },
  { date: 'Feb 18', violations: 48, helmets: 14, overspeeds: 19, signals: 15 },
  { date: 'Feb 19', violations: 61, helmets: 22, overspeeds: 25, signals: 14 },
  { date: 'Feb 20', violations: 55, helmets: 16, overspeeds: 21, signals: 18 },
  { date: 'Feb 21', violations: 67, helmets: 24, overspeeds: 28, signals: 15 },
  { date: 'Feb 22', violations: 58, helmets: 19, overspeeds: 24, signals: 15 },
  { date: 'Feb 23', violations: 42, helmets: 18, overspeeds: 16, signals: 8 }
];

// Violation distribution
export const mockViolationDistribution = [
  { name: 'Helmet Violations', value: 36, color: '#4F46E5' },
  { name: 'Overspeed Violations', value: 42, color: '#10B981' },
  { name: 'Signal Violations', value: 12, color: '#F59E0B' },
  { name: 'Other Violations', value: 10, color: '#8B5CF6' }
];

// Location-based analysis
export const mockLocationAnalysis = [
  { location: 'M.G. Road', violations: 156 },
  { location: 'Whitefield Road', violations: 142 },
  { location: 'ORR', violations: 134 },
  { location: 'Koramangala', violations: 128 },
  { location: 'Indiranagar', violations: 112 },
  { location: 'BTM Layout', violations: 98 }
];

// Device performance
export const mockDevicePerformance = [
  { deviceId: 'CAM-BNG-001', uptime: 98.5, events: 1256 },
  { deviceId: 'CAM-BNG-002', uptime: 99.2, events: 892 },
  { deviceId: 'CAM-BNG-004', uptime: 97.9, events: 1543 },
  { deviceId: 'CAM-BNG-005', uptime: 98.8, events: 967 },
  { deviceId: 'CAM-BNG-006', uptime: 98.2, events: 1123 }
];
