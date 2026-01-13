// Types for disaster management system
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  coordinates: Coordinates;
  city: string;
  region: string;
  country: string;
}

export type DisasterType = 'earthquake' | 'flood' | 'fire' | 'storm' | 'volcano' | 'tsunami';

export interface Disaster {
  id: string;
  type: DisasterType;
  title: string;
  location: Coordinates;
  city: string;
  country: string;
  date: Date;
  severity: 1 | 2 | 3 | 4 | 5;
  casualties?: number;
  damageEstimate?: string;
  description: string;
  isActive?: boolean;
}

export interface DisasterStats {
  type: DisasterType;
  count: number;
  averageSeverity: number;
  lastOccurrence: Date;
  riskScore: number; // 1-10
}

export interface SeasonalPattern {
  month: string;
  disasters: number;
  dominant: DisasterType;
}

export interface AnalysisResult {
  location: Location;
  nearbyCities: { name: string; distance: number; coordinates: Coordinates }[];
  disasters: Disaster[];
  stats: DisasterStats[];
  seasonalPatterns: SeasonalPattern[];
  overallRiskScore: number;
}

// Disaster type configurations with vibrant colors for 3D globe visibility
export const disasterConfig: Record<DisasterType, { label: string; icon: string; color: string; bgClass: string }> = {
  earthquake: { label: 'Earthquake', icon: '🌍', color: '#ff9933', bgClass: 'bg-disaster-earthquake' },      // Bright orange
  flood: { label: 'Flood', icon: '🌊', color: '#00d4ff', bgClass: 'bg-disaster-flood' },                    // Cyan
  fire: { label: 'Wildfire', icon: '🔥', color: '#ff4d1a', bgClass: 'bg-disaster-fire' },                    // Bright red-orange
  storm: { label: 'Storm', icon: '🌀', color: '#a855f7', bgClass: 'bg-disaster-storm' },                     // Vivid purple
  volcano: { label: 'Volcano', icon: '🌋', color: '#e60000', bgClass: 'bg-disaster-volcano' },                 // Deep red
  tsunami: { label: 'Tsunami', icon: '🌊', color: '#00ffff', bgClass: 'bg-disaster-tsunami' },              // Bright aqua
};

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Mock city database (in production, use a real geocoding API)
export const mockCities: { name: string; coordinates: Coordinates; country: string }[] = [
  { name: 'Mumbai', coordinates: { lat: 19.076, lng: 72.8777 }, country: 'India' },
  { name: 'Thane', coordinates: { lat: 19.2183, lng: 72.9781 }, country: 'India' },
  { name: 'Navi Mumbai', coordinates: { lat: 19.033, lng: 73.0297 }, country: 'India' },
  { name: 'Pune', coordinates: { lat: 18.5204, lng: 73.8567 }, country: 'India' },
  { name: 'Delhi', coordinates: { lat: 28.6139, lng: 77.209 }, country: 'India' },
  { name: 'Gurgaon', coordinates: { lat: 28.4595, lng: 77.0266 }, country: 'India' },
  { name: 'Noida', coordinates: { lat: 28.5355, lng: 77.391 }, country: 'India' },
  { name: 'Faridabad', coordinates: { lat: 28.4089, lng: 77.3178 }, country: 'India' },
  { name: 'Tokyo', coordinates: { lat: 35.6762, lng: 139.6503 }, country: 'Japan' },
  { name: 'Yokohama', coordinates: { lat: 35.4437, lng: 139.638 }, country: 'Japan' },
  { name: 'Kawasaki', coordinates: { lat: 35.5309, lng: 139.7029 }, country: 'Japan' },
  { name: 'San Francisco', coordinates: { lat: 37.7749, lng: -122.4194 }, country: 'USA' },
  { name: 'Oakland', coordinates: { lat: 37.8044, lng: -122.2712 }, country: 'USA' },
  { name: 'San Jose', coordinates: { lat: 37.3382, lng: -121.8863 }, country: 'USA' },
  { name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 }, country: 'USA' },
  { name: 'Long Beach', coordinates: { lat: 33.7701, lng: -118.1937 }, country: 'USA' },
  { name: 'London', coordinates: { lat: 51.5074, lng: -0.1278 }, country: 'UK' },
  { name: 'Jakarta', coordinates: { lat: -6.2088, lng: 106.8456 }, country: 'Indonesia' },
  { name: 'Manila', coordinates: { lat: 14.5995, lng: 120.9842 }, country: 'Philippines' },
  { name: 'Bangkok', coordinates: { lat: 13.7563, lng: 100.5018 }, country: 'Thailand' },
];

// Generate mock historical disaster data
export function generateMockDisasters(centerCoords: Coordinates, radiusKm: number = 50): Disaster[] {
  const disasterTypes: DisasterType[] = ['earthquake', 'flood', 'fire', 'storm', 'volcano', 'tsunami'];
  const disasters: Disaster[] = [];
  
  // Find nearby cities
  const nearbyCities = mockCities.filter(city => 
    calculateDistance(centerCoords, city.coordinates) <= radiusKm
  );

  // Generate random disasters for the past 10 years
  const now = new Date();
  const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);

  for (let i = 0; i < 50; i++) {
    const randomDate = new Date(
      tenYearsAgo.getTime() + Math.random() * (now.getTime() - tenYearsAgo.getTime())
    );
    
    const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    const severity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
    
    // Random location within radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusKm;
    const lat = centerCoords.lat + (distance / 111) * Math.cos(angle);
    const lng = centerCoords.lng + (distance / (111 * Math.cos(toRad(centerCoords.lat)))) * Math.sin(angle);
    
    const nearestCity = nearbyCities.length > 0 
      ? nearbyCities[Math.floor(Math.random() * nearbyCities.length)]
      : { name: 'Unknown Area', country: 'Unknown' };

    disasters.push({
      id: `disaster-${i}`,
      type,
      title: `${disasterConfig[type].label} in ${nearestCity.name}`,
      location: { lat, lng },
      city: nearestCity.name,
      country: nearestCity.country,
      date: randomDate,
      severity,
      casualties: severity > 3 ? Math.floor(Math.random() * 100) : undefined,
      damageEstimate: severity > 2 ? `$${Math.floor(Math.random() * 500)}M` : undefined,
      description: `A ${severity > 3 ? 'major' : 'moderate'} ${disasterConfig[type].label.toLowerCase()} event affecting the ${nearestCity.name} area.`,
      isActive: randomDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    });
  }

  return disasters.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Calculate statistics from disasters
export function calculateStats(disasters: Disaster[]): DisasterStats[] {
  const typeGroups = disasters.reduce((acc, d) => {
    if (!acc[d.type]) acc[d.type] = [];
    acc[d.type].push(d);
    return acc;
  }, {} as Record<DisasterType, Disaster[]>);

  return Object.entries(typeGroups).map(([type, items]) => {
    const avgSeverity = items.reduce((sum, d) => sum + d.severity, 0) / items.length;
    const lastOccurrence = items.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date;
    const riskScore = Math.min(10, Math.round((items.length / 5) * avgSeverity));

    return {
      type: type as DisasterType,
      count: items.length,
      averageSeverity: Math.round(avgSeverity * 10) / 10,
      lastOccurrence,
      riskScore,
    };
  }).sort((a, b) => b.count - a.count);
}

// Calculate seasonal patterns
export function calculateSeasonalPatterns(disasters: Disaster[]): SeasonalPattern[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, index) => {
    const monthDisasters = disasters.filter(d => d.date.getMonth() === index);
    const typeCounts = monthDisasters.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<DisasterType, number>);
    
    const dominant = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as DisasterType || 'flood';

    return {
      month,
      disasters: monthDisasters.length,
      dominant,
    };
  });
}

// Find cities within radius
export function findCitiesInRadius(center: Coordinates, radiusKm: number): { name: string; distance: number; coordinates: Coordinates }[] {
  return mockCities
    .map(city => ({
      name: city.name,
      coordinates: city.coordinates,
      distance: calculateDistance(center, city.coordinates),
    }))
    .filter(city => city.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// Full analysis function
export function analyzeLocation(coordinates: Coordinates): AnalysisResult {
  let nearestCity: (typeof mockCities[0] & { distance: number }) | null = null;
  
  for (const city of mockCities) {
    const distance = calculateDistance(coordinates, city.coordinates);
    if (!nearestCity || distance < nearestCity.distance) {
      nearestCity = { ...city, distance };
    }
  }

  const location: Location = {
    coordinates,
    city: nearestCity?.name || 'Unknown',
    region: nearestCity?.name || 'Unknown Region',
    country: nearestCity?.country || 'Unknown',
  };

  const nearbyCities = findCitiesInRadius(coordinates, 50);
  const disasters = generateMockDisasters(coordinates, 50);
  const stats = calculateStats(disasters);
  const seasonalPatterns = calculateSeasonalPatterns(disasters);
  const overallRiskScore = Math.round(stats.reduce((sum, s) => sum + s.riskScore, 0) / stats.length);

  return {
    location,
    nearbyCities,
    disasters,
    stats,
    seasonalPatterns,
    overallRiskScore,
  };
}

// Global disasters for 3D globe
export function generateGlobalDisasters(): Disaster[] {
  const globalHotspots: { lat: number; lng: number; types: DisasterType[]; region: string }[] = [
    { lat: 35.6762, lng: 139.6503, types: ['earthquake', 'tsunami'], region: 'Japan' },
    { lat: 37.7749, lng: -122.4194, types: ['earthquake', 'fire'], region: 'California' },
    { lat: -6.2088, lng: 106.8456, types: ['flood', 'volcano', 'earthquake'], region: 'Indonesia' },
    { lat: 19.076, lng: 72.8777, types: ['flood', 'storm'], region: 'India' },
    { lat: 14.5995, lng: 120.9842, types: ['storm', 'flood', 'volcano'], region: 'Philippines' },
    { lat: 25.7617, lng: -80.1918, types: ['storm', 'flood'], region: 'Florida' },
    { lat: -23.5505, lng: -46.6333, types: ['flood', 'fire'], region: 'Brazil' },
    { lat: 34.0522, lng: -118.2437, types: ['fire', 'earthquake'], region: 'Los Angeles' },
    { lat: 51.5074, lng: -0.1278, types: ['flood', 'storm'], region: 'UK' },
    { lat: 55.7558, lng: 37.6173, types: ['fire'], region: 'Russia' },
    { lat: -33.8688, lng: 151.2093, types: ['fire', 'flood'], region: 'Australia' },
    { lat: 28.6139, lng: 77.209, types: ['flood', 'storm'], region: 'Delhi' },
    { lat: 13.7563, lng: 100.5018, types: ['flood'], region: 'Thailand' },
    { lat: 41.9028, lng: 12.4964, types: ['earthquake'], region: 'Italy' },
    { lat: 35.6892, lng: 51.389, types: ['earthquake'], region: 'Iran' },
    { lat: 19.4326, lng: -99.1332, types: ['earthquake'], region: 'Mexico' },
    { lat: -4.4419, lng: 15.2663, types: ['flood'], region: 'Congo' },
    { lat: 30.0444, lng: 31.2357, types: ['flood'], region: 'Egypt' },
  ];

  const disasters: Disaster[] = [];
  const now = new Date();

  globalHotspots.forEach((hotspot, index) => {
    hotspot.types.forEach((type, typeIndex) => {
      // Add multiple disasters per hotspot
      for (let i = 0; i < 3; i++) {
        const randomDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const severity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
        
        // Slight position variance
        const lat = hotspot.lat + (Math.random() - 0.5) * 2;
        const lng = hotspot.lng + (Math.random() - 0.5) * 2;

        disasters.push({
          id: `global-${index}-${typeIndex}-${i}`,
          type,
          title: `${disasterConfig[type].label} in ${hotspot.region}`,
          location: { lat, lng },
          city: hotspot.region,
          country: hotspot.region,
          date: randomDate,
          severity,
          casualties: severity > 3 ? Math.floor(Math.random() * 500) : undefined,
          damageEstimate: severity > 2 ? `$${Math.floor(Math.random() * 1000)}M` : undefined,
          description: `A significant ${disasterConfig[type].label.toLowerCase()} event in the ${hotspot.region} region.`,
          isActive: randomDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        });
      }
    });
  });

  return disasters;
}

// ============================================================================
// API INTEGRATION FUNCTIONS
// ============================================================================

import { locationAPI, disastersAPI, visualizationAPI } from './api';

/**
 * Map backend disaster types to frontend disaster types
 * Backend has more types than frontend, so we need to map them
 */
function mapBackendTypeToFrontend(backendType: string): DisasterType {
  if (!backendType) {
    console.warn('mapBackendTypeToFrontend: received empty/null type, defaulting to storm');
    return 'storm';
  }

  const typeMap: Record<string, DisasterType> = {
    // Direct matches
    'earthquake': 'earthquake',
    'flood': 'flood',
    'fire': 'fire',
    'wildfire': 'fire',
    'storm': 'storm',
    'volcano': 'volcano',
    'tsunami': 'tsunami',
    
    // Storm variants
    'hurricane': 'storm',
    'tornado': 'storm',
    'cyclone': 'storm',
    'dust': 'storm',
    'snow': 'storm',
    'ice': 'storm',
    'avalanche': 'storm',
    
    // Flood variants
    'drought': 'flood',
    'water': 'flood',
    
    // Earthquake variants
    'landslide': 'earthquake',
    
    // Fire variants
    'temperature': 'fire',
    
    // Tsunami variants
    'sea': 'tsunami',
  };

  const normalized = backendType.toLowerCase().trim();
  const mapped = typeMap[normalized];
  
  if (!mapped) {
    console.warn(`mapBackendTypeToFrontend: unknown type "${backendType}", defaulting to storm`);
    return 'storm';
  }
  
  return mapped;
}

/**
 * Fetch real location analysis from backend API
 */
export async function analyzeLocationAPI(coordinates: Coordinates): Promise<AnalysisResult> {
  try {
    const response = await locationAPI.analyzeLocation({
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      radius: 50,
    });

    console.log('API Response:', response); // Debug log

    // Access the nested data structure (response.data contains the API wrapper, response.data.data contains actual data)
    const apiData = response.data;

    // Transform API response to match our AnalysisResult interface
    const location: Location = {
      coordinates,
      city: apiData.location?.city || 'Unknown',
      region: apiData.location?.region || 'Unknown',
      country: apiData.location?.country || 'Unknown',
    };

    // Transform nearby cities - handle both possible coordinate formats
    const nearbyCities = (apiData.nearbyCities || []).map((city: any) => ({
      name: city.name,
      distance: city.distance,
      coordinates: {
        lat: city.coordinates?.latitude || city.coordinates?.lat || 0,
        lng: city.coordinates?.longitude || city.coordinates?.lng || 0,
      },
    }));

    // Transform recent disasters to our format
    const disasters: Disaster[] = (apiData.recentDisasters || []).map((d: any) => {
      // MongoDB stores coordinates as [longitude, latitude]
      const lng = d.location?.coordinates?.[0] || 0;
      const lat = d.location?.coordinates?.[1] || 0;

      return {
        id: d._id || d.id,
        type: mapBackendTypeToFrontend(d.type),
        title: d.title,
        location: { lat, lng },
        city: d.location?.city || 'Affected Area',
        country: d.location?.country || apiData.location?.country || 'Region',
        date: new Date(d.dateOccurred || d.date),
        severity: (d.severity || 3) as 1 | 2 | 3 | 4 | 5,
        casualties: d.casualties?.deaths || 0,
        damageEstimate: d.damage?.estimated ? `$${Math.round(d.damage.estimated / 1000000)}M` : undefined,
        description: d.description || d.title,
        isActive: d.isActive || false,
      };
    });

    console.log(`Mapped ${disasters.length} disasters from API`); // Debug log

    // Transform statistics
    const stats: DisasterStats[] = (apiData.topDisasters || []).map((item: any) => {
      const mappedType = mapBackendTypeToFrontend(item.type);
      const typeDisasters = disasters.filter(d => d.type === mappedType);
      const avgSeverity = typeDisasters.length > 0
        ? typeDisasters.reduce((sum, d) => sum + d.severity, 0) / typeDisasters.length
        : 3;
      const lastOccurrence = typeDisasters.length > 0
        ? typeDisasters.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
        : new Date();

      return {
        type: mappedType,
        count: item.count,
        averageSeverity: Math.round(avgSeverity * 10) / 10,
        lastOccurrence,
        riskScore: Math.min(10, Math.round((item.count / 5) * avgSeverity)),
      };
    });

    // Transform seasonal patterns
    const seasonalPatterns: SeasonalPattern[] = (apiData.seasonalPatterns || []).map((pattern: any) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dominantType = Object.entries(pattern.types || {}).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
      
      return {
        month: monthNames[pattern.month - 1] || 'Unknown',
        disasters: pattern.count || 0,
        dominant: dominantType?.[0] ? mapBackendTypeToFrontend(dominantType[0] as string) : 'flood',
      };
    });

    return {
      location,
      nearbyCities,
      disasters,
      stats,
      seasonalPatterns,
      overallRiskScore: apiData.riskScore || 5,
    };
  } catch (error) {
    console.error('Error fetching location analysis from API:', error);
    // Fallback to mock data
    return analyzeLocation(coordinates);
  }
}

/**
 * Fetch global disasters for 3D globe from backend API
 * Fetches a balanced sample of each disaster type to ensure diversity
 */
export async function fetchGlobalDisastersAPI(): Promise<Disaster[]> {
  try {
    // Define all backend disaster types we want to fetch
    const backendTypes = [
      'earthquake', 'flood', 'wildfire', 'storm', 'volcano', 'tsunami',
      'hurricane', 'tornado', 'cyclone', 'drought', 'landslide', 'fire'
    ];
    
    const allDisasters: Disaster[] = [];
    
    // Fetch disasters for each type separately to ensure balanced representation
    for (const type of backendTypes) {
      try {
        const response = await disastersAPI.getAllDisasters({
          limit: 50, // Fetch 50 of each type
          page: 1,
          type: type,
        });

        const disasters: Disaster[] = response.data.disasters
          .map((d: any) => ({
            id: d._id || d.id,
            type: mapBackendTypeToFrontend(d.type),
            title: d.title,
            location: {
              lat: d.location?.coordinates?.[1] || d.location?.latitude || 0,
              lng: d.location?.coordinates?.[0] || d.location?.longitude || 0,
            },
            city: d.location?.city || 'Unknown',
            country: d.location?.country || 'Unknown',
            date: new Date(d.dateOccurred || d.date),
            severity: (d.severity || 3) as 1 | 2 | 3 | 4 | 5,
            casualties: d.casualties,
            damageEstimate: d.estimatedDamage,
            description: d.description || d.title,
            isActive: d.isActive,
          }))
          .filter((d: Disaster) => d.location.lat !== 0 && d.location.lng !== 0);

        allDisasters.push(...disasters);
      } catch (typeError) {
        // Continue if a specific type fails
        console.warn(`Failed to fetch ${type} disasters:`, typeError);
      }
    }

    // Log type distribution for debugging
    const typeDistribution = allDisasters.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`Fetched ${allDisasters.length} disasters from API for globe`);
    console.log('Disaster type distribution:', typeDistribution);
    
    return allDisasters.length > 0 ? allDisasters : generateGlobalDisasters();
  } catch (error) {
    console.error('Error fetching global disasters from API:', error);
    // Fallback to mock data
    return generateGlobalDisasters();
  }
}

/**
 * Update disaster data from external sources
 */
export async function updateDisasterDataAPI(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await disastersAPI.updateDisasterData();
    return {
      success: response.success,
      message: `Updated ${response.data.saved} disasters, ${response.data.updated} updated`,
    };
  } catch (error) {
    console.error('Error updating disaster data:', error);
    return {
      success: false,
      message: 'Failed to update disaster data',
    };
  }
}
