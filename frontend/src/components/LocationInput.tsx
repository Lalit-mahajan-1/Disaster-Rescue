import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Coordinates } from '@/lib/disaster-data';

interface LocationInputProps {
  onLocationSelect: (coords: Coordinates, locationName: string) => void;
  isLoading?: boolean;
}

export function LocationInput({ onLocationSelect, isLoading }: LocationInputProps) {
  const [address, setAddress] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeolocation = async () => {
    setIsGeolocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsGeolocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
          );
          const data = await response.json();
          const locationName = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
          onLocationSelect(coords, locationName);
        } catch {
          onLocationSelect(coords, 'Your Location');
        }
        
        setIsGeolocating(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enter manually.');
        setIsGeolocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) return;
    
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length === 0) {
        setError('Location not found. Please try a different address.');
        return;
      }

      const coords: Coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      
      onLocationSelect(coords, data[0].display_name.split(',')[0]);
    } catch {
      setError('Failed to search location. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };

  return (
    <GlassCard variant="strong" className="p-6 md:p-8 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Discover Disaster Risks in Your Area
          </h2>
          <p className="text-muted-foreground">
            Enter your location to analyze historical disaster patterns and assess regional risks
          </p>
        </div>

        {/* Auto-detect button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleGeolocation}
            disabled={isGeolocating || isLoading}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            {isGeolocating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Detecting Location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 mr-2" />
                Use My Current Location
              </>
            )}
          </Button>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Manual address input */}
        <div className="space-y-3">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city, address, or coordinates..."
                className="pl-10 h-14 bg-secondary/50 border-border/50 focus:border-primary text-lg"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleAddressSearch}
              disabled={isLoading || !address.trim()}
              className="h-14 px-6 bg-secondary hover:bg-secondary/80"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Try: "Tokyo, Japan" or "San Francisco, USA" or "Mumbai, India"
          </p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center"
          >
            {error}
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
