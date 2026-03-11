/// <reference types="vite/client" />
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Ignore JSON parse errors
    }
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export const api = {
  // Violations
  getViolations: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi<any>(`/api/violations${query ? `?${query}` : ''}`);
  },
  
  getViolation: (id: string) => fetchApi<any>(`/api/violations/${id}`),
  
  updateViolationStatus: (id: string, status: string) => 
    fetchApi<any>(`/api/violations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Vehicles
  getVehicles: (page = 1, limit = 20) => 
    fetchApi<any>(`/api/vehicles?page=${page}&limit=${limit}`),
    
  getHighRiskVehicles: () => fetchApi<any>('/api/vehicles/high-risk'),
  
  searchVehicles: (query: string) => fetchApi<any>(`/api/vehicles/search?q=${encodeURIComponent(query)}`),
  
  getVehicleDetail: (plate: string) => fetchApi<any>(`/api/vehicles/${encodeURIComponent(plate)}`),

  // Analytics
  getAnalyticsSummary: () => fetchApi<any>('/api/analytics/summary'),
  getAnalyticsTrends: (period = '7d') => fetchApi<any>(`/api/analytics/trends?period=${period}`),
  getAnalyticsByType: () => fetchApi<any>('/api/analytics/by-type'),
  getAnalyticsByCamera: () => fetchApi<any>('/api/analytics/by-camera'),
  getAnalyticsHeatmap: () => fetchApi<any>('/api/analytics/heatmap'),
  getAnalyticsPeakHours: () => fetchApi<any>('/api/analytics/peak-hours'),
  getAnalyticsHotspots: () => fetchApi<any>('/api/analytics/hotspots'),

  // Live
  getLiveStatus: () => fetchApi<any>('/api/live/status'),
};
