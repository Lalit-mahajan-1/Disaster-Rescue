import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates, Disaster, disasterConfig, DisasterType } from '@/lib/disaster-data';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface DisasterMapProps {
  center: Coordinates;
  disasters: Disaster[];
  nearbyCities: { name: string; distance: number; coordinates: Coordinates }[];
  onMarkerClick?: (disaster: Disaster) => void;
}

// Custom disaster marker icon
function createDisasterIcon(type: DisasterType, isActive: boolean): L.DivIcon {
  const config = disasterConfig[type] || disasterConfig['storm'];
  const size = isActive ? 20 : 14;
  const pulseClass = isActive ? 'animate-pulse' : '';
  
  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `
      <div class="relative flex items-center justify-center ${pulseClass}">
        <div class="absolute w-${size} h-${size} rounded-full opacity-50" style="background-color: ${config.color}; filter: blur(4px);"></div>
        <div class="relative w-${size / 1.5} h-${size / 1.5} rounded-full flex items-center justify-center" style="background-color: ${config.color};">
          <span style="font-size: 10px;">${config.icon}</span>
        </div>
      </div>
    `,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });
}

// Component to recenter map when center changes
function MapController({ center }: { center: Coordinates }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], 10);
  }, [center, map]);
  
  return null;
}

export function DisasterMap({ center, disasters, nearbyCities, onMarkerClick }: DisasterMapProps) {
  const userIcon = useMemo(() => L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-primary/30 animate-ping"></div>
        <div class="relative w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-lg">
          <span class="text-xs">📍</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  const cityIcon = useMemo(() => L.divIcon({
    className: 'custom-city-marker',
    html: `
      <div class="w-3 h-3 rounded-full bg-accent/70 border border-accent shadow-sm"></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }), []);

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border/50">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={10}
        className="w-full h-full"
        style={{ background: 'hsl(222 47% 6%)' }}
      >
        <MapController center={center} />
        
        {/* Dark tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 50km radius circle */}
        <Circle
          center={[center.lat, center.lng]}
          radius={50000}
          pathOptions={{
            color: 'hsl(175 80% 45%)',
            fillColor: 'hsl(175 80% 45%)',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10',
          }}
        />

        {/* User location marker */}
        <Marker position={[center.lat, center.lng]} icon={userIcon}>
          <Popup className="glass-popup">
            <div className="text-foreground">
              <strong>Your Location</strong>
              <p className="text-sm text-muted-foreground">
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby city markers */}
        {nearbyCities.slice(0, 10).map((city, index) => (
          <Marker
            key={`city-${index}`}
            position={[city.coordinates.lat, city.coordinates.lng]}
            icon={cityIcon}
          >
            <Popup>
              <div className="text-foreground">
                <strong>{city.name}</strong>
                <p className="text-sm text-muted-foreground">
                  {city.distance.toFixed(1)} km away
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Disaster markers */}
        {disasters.slice(0, 30).map((disaster) => (
          <Marker
            key={disaster.id}
            position={[disaster.location.lat, disaster.location.lng]}
            icon={createDisasterIcon(disaster.type, disaster.isActive || false)}
            eventHandlers={{
              click: () => onMarkerClick?.(disaster),
            }}
          >
            <Popup>
              <div className="text-foreground min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{(disasterConfig[disaster.type] || disasterConfig['storm']).icon}</span>
                  <strong>{disaster.title}</strong>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Date:</span> {disaster.date.toLocaleDateString()}</p>
                  <p><span className="text-muted-foreground">Severity:</span> {disaster.severity}/5</p>
                  {disaster.casualties && (
                    <p><span className="text-muted-foreground">Casualties:</span> {disaster.casualties}</p>
                  )}
                  {disaster.damageEstimate && (
                    <p><span className="text-muted-foreground">Damage:</span> {disaster.damageEstimate}</p>
                  )}
                </div>
                {disaster.isActive && (
                  <div className="mt-2 px-2 py-1 bg-destructive/20 text-destructive text-xs rounded font-medium">
                    Active Event
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
