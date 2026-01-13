import { useRef, useMemo, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Disaster, disasterConfig, DisasterType, generateGlobalDisasters, fetchGlobalDisastersAPI } from '@/lib/disaster-data';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';

interface EarthGlobeProps {
  userLocation?: { lat: number; lng: number };
  onDisasterClick?: (disaster: Disaster) => void;
}

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Disaster marker component
function DisasterMarker({ 
  disaster, 
  radius, 
  onClick,
  isActive 
}: { 
  disaster: Disaster; 
  radius: number; 
  onClick: () => void;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => 
    latLngToVector3(disaster.location.lat, disaster.location.lng, radius + 0.05), 
    [disaster.location, radius]
  );
  
  const config = disasterConfig[disaster.type] || disasterConfig['storm'];
  const color = useMemo(() => new THREE.Color(config.color), [config.color]);
  
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + disaster.id.length) * 0.2;
      meshRef.current.scale.setScalar(isActive ? scale * 1.5 : scale);
    }
  });

  const size = disaster.severity * 0.015; // Increased from 0.01 to make markers more visible

  return (
    <group 
      position={position}
      onClick={(e) => {
        console.log('Disaster marker clicked:', disaster.title, disaster.type);
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Main marker sphere with vibrant disaster type color */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.2 : 0.8}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
      
      {/* Outer glow with disaster type color */}
      <mesh>
        <sphereGeometry args={[size * 1.8, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.5 : 0.35}
        />
      </mesh>

      {/* Pulsing ring for active disasters */}
      {disaster.isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 2.5, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Create a procedural Earth texture with continents and oceans
function createEarthTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Ocean base
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#1a3a52');
  oceanGradient.addColorStop(0.5, '#2563eb');
  oceanGradient.addColorStop(1, '#1e40af');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Simplified continent shapes (approximate)
  ctx.fillStyle = '#22c55e'; // Green for land
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 2;

  // North America
  ctx.beginPath();
  ctx.ellipse(300, 300, 200, 250, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // South America
  ctx.beginPath();
  ctx.ellipse(400, 650, 120, 200, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Europe
  ctx.beginPath();
  ctx.ellipse(1000, 250, 150, 120, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Africa
  ctx.beginPath();
  ctx.ellipse(1050, 500, 180, 250, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Asia
  ctx.beginPath();
  ctx.ellipse(1400, 300, 300, 250, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Australia
  ctx.beginPath();
  ctx.ellipse(1600, 700, 150, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antarctica (bottom)
  ctx.fillStyle = '#e0f2fe'; // Ice
  ctx.fillRect(0, 900, canvas.width, 124);

  // Add some texture noise
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
    ctx.fillRect(x, y, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Earth sphere component
function Earth({ disasters, onDisasterClick, filter }: { 
  disasters: Disaster[]; 
  onDisasterClick: (disaster: Disaster) => void;
  filter: DisasterType | 'all';
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Create procedural Earth texture
  const earthTexture = useMemo(() => createEarthTexture(), []);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }
  });

  const filteredDisasters = useMemo(() => {
    if (filter === 'all') return disasters;
    return disasters.filter(d => d.type === filter);
  }, [disasters, filter]);

  return (
    <>
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
          `}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* Earth with procedural texture */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          shininess={10}
          specular={new THREE.Color('#222244')}
        />
      </mesh>

      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.01}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Disaster markers */}
      {filteredDisasters.map((disaster) => (
        <DisasterMarker
          key={disaster.id}
          disaster={disaster}
          radius={2}
          onClick={() => onDisasterClick(disaster)}
          isActive={disaster.isActive || false}
        />
      ))}
    </>
  );
}

// Scene setup
function Scene({ disasters, onDisasterClick, filter }: { 
  disasters: Disaster[]; 
  onDisasterClick: (disaster: Disaster) => void;
  filter: DisasterType | 'all';
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Earth disasters={disasters} onDisasterClick={onDisasterClick} filter={filter} />
      
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main component
export function EarthGlobe({ userLocation, onDisasterClick }: EarthGlobeProps) {
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [filter, setFilter] = useState<DisasterType | 'all'>('all');
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch disasters on mount
  useEffect(() => {
    loadDisasters();
  }, []);

  const loadDisasters = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGlobalDisastersAPI();
      setDisasters(data);
      
      // Log disaster type distribution for debugging
      const typeCounts = data.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Disaster type distribution:', typeCounts);
      console.log('Sample disasters:', data.slice(0, 5).map(d => ({ type: d.type, title: d.title, color: disasterConfig[d.type].color })));
    } catch (error) {
      console.error('Error loading disasters:', error);
      // Fallback to mock data
      setDisasters(generateGlobalDisasters());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDisasters();
    setIsRefreshing(false);
  };

  const handleDisasterClick = useCallback((disaster: Disaster) => {
    console.log('handleDisasterClick called with:', disaster.title, disaster.type);
    setSelectedDisaster(disaster);
    console.log('selectedDisaster state updated');
    onDisasterClick?.(disaster);
  }, [onDisasterClick]);

  const disasterTypes: (DisasterType | 'all')[] = ['all', 'earthquake', 'flood', 'fire', 'storm', 'volcano', 'tsunami'];

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <GlassCard className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading global disaster data...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a1a', 1);
        }}
      >
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading Earth...</p>
            </div>
          </Html>
        }>
          <Scene 
            disasters={disasters} 
            onDisasterClick={handleDisasterClick}
            filter={filter}
          />
        </Suspense>
      </Canvas>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {disasterTypes.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? 'default' : 'secondary'}
              onClick={() => setFilter(type)}
              className="text-xs"
            >
              {type === 'all' ? '🌍 All' : `${(disasterConfig[type] || disasterConfig['storm']).icon} ${(disasterConfig[type] || disasterConfig['storm']).label}`}
            </Button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh disaster data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4">
        <GlassCard className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{disasters.length}</div>
              <div className="text-xs text-muted-foreground">Total Disasters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-risk-high">
                {disasters.filter(d => d.isActive).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-risk-moderate">
                {new Set(disasters.map(d => d.country)).size}
              </div>
              <div className="text-xs text-muted-foreground">Regions</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4">
        <GlassCard className="p-3">
          <div className="text-xs font-medium mb-2">Disaster Types</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(disasterConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Selected disaster popup */}
      <AnimatePresence>
        {selectedDisaster && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 w-80"
          >
            <GlassCard variant="strong" className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{(disasterConfig[selectedDisaster.type] || disasterConfig['storm']).icon}</span>
                  <div>
                    <h3 className="font-semibold">{selectedDisaster.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDisaster.city}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setSelectedDisaster(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(selectedDisaster.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity</span>
                  <span className={selectedDisaster.severity >= 4 ? 'text-risk-high' : 'text-risk-moderate'}>
                    {selectedDisaster.severity}/5
                  </span>
                </div>
                {selectedDisaster.casualties && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Casualties</span>
                    <span className="text-risk-high">{selectedDisaster.casualties}</span>
                  </div>
                )}
                {selectedDisaster.damageEstimate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Damage</span>
                    <span>{selectedDisaster.damageEstimate}</span>
                  </div>
                )}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {selectedDisaster.description}
              </p>

              {selectedDisaster.isActive && (
                <div className="mt-3 px-3 py-2 bg-destructive/20 rounded-lg border border-destructive/30">
                  <span className="text-xs font-medium text-destructive">⚠️ Active Event</span>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
