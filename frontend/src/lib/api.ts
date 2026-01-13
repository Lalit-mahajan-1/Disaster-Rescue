import axios from 'axios';
import { Coordinates, Disaster, DisasterStats, SeasonalPattern } from './disaster-data';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface LocationAnalysisResponse {
  success: boolean;
  data: {
    location: {
      latitude: number;
      longitude: number;
      city: string;
      region: string;
      country: string;
      formattedAddress: string;
    };
    searchRadius: number;
    statistics: {
      total: number;
      active: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      byYear: Record<string, number>;
    };
    riskScore: number;
    topDisasters: Array<{ type: string; count: number }>;
    seasonalPatterns: Array<{
      month: number;
      count: number;
      types: Record<string, number>;
    }>;
    nearbyCities: Array<{
      name: string;
      distance: number;
      coordinates: { latitude: number; longitude: number };
    }>;
    recommendations: string[];
    futureTrends: Record<string, { trend: string; confidence: number }>;
    recentDisasters: any[];
  };
}

export interface DisastersResponse {
  success: boolean;
  data: {
    disasters: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface VisualizationDataResponse {
  success: boolean;
  data: {
    disasters: any[];
    globalStats: {
      total: number;
      active: number;
      byType: Record<string, number>;
      byRegion: Record<string, number>;
    };
  };
}

// Location API
export const locationAPI = {
  analyzeLocation: async (params: { address?: string; latitude?: number; longitude?: number; radius?: number }) => {
    const response = await api.post<LocationAnalysisResponse>('/location/analyze', params);
    return response.data;
  },

  geocode: async (address: string) => {
    const response = await api.post('/location/geocode', { address });
    return response.data;
  },

  reverseGeocode: async (latitude: number, longitude: number) => {
    const response = await api.get('/location/reverse-geocode', {
      params: { latitude, longitude },
    });
    return response.data;
  },

  getNearbyCities: async (latitude: number, longitude: number, radius: number = 50) => {
    const response = await api.get('/location/nearby-cities', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },
};

// Disasters API
export const disastersAPI = {
  getAllDisasters: async (params?: {
    type?: string;
    severity?: number;
    startDate?: string;
    endDate?: string;
    country?: string;
    isActive?: boolean;
    limit?: number;
    page?: number;
  }) => {
    const response = await api.get<DisastersResponse>('/disasters', { params });
    return response.data;
  },

  getDisasterById: async (id: string) => {
    const response = await api.get(`/disasters/${id}`);
    return response.data;
  },

  getActiveDisasters: async () => {
    const response = await api.get('/disasters/active');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/disasters/stats');
    return response.data;
  },

  searchDisasters: async (query: string, limit: number = 20) => {
    const response = await api.get('/disasters/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  updateDisasterData: async () => {
    const response = await api.post('/disasters/update-data');
    return response.data;
  },

  getDisastersByType: async (type: string, limit: number = 50, page: number = 1) => {
    const response = await api.get(`/disasters/type/${type}`, {
      params: { limit, page },
    });
    return response.data;
  },
};

// Visualization API
export const visualizationAPI = {
  getGlobeData: async (params?: {
    startDate?: string;
    endDate?: string;
    types?: string[];
    minSeverity?: number;
  }) => {
    const response = await api.get('/visualization/globe-data', { params });
    return response.data;
  },

  getHeatmapData: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const response = await api.get('/visualization/heatmap', { params });
    return response.data;
  },

  getTimelineData: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'month' | 'year';
  }) => {
    const response = await api.get('/visualization/timeline', { params });
    return response.data;
  },

  getAnimationSequence: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const response = await api.get('/visualization/animation-sequence', { params });
    return response.data;
  },

  getClusters: async (params?: {
    minClusterSize?: number;
    maxDistance?: number;
  }) => {
    const response = await api.get('/visualization/clusters', { params });
    return response.data;
  },
};

export default api;
