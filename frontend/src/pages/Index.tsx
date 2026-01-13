import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, MapPin, BarChart3, AlertTriangle, Shield, Loader2, ScrollText } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { DisasterMap } from '@/components/DisasterMap';
import { DisasterStatsComponent } from '@/components/DisasterStats';
import { DisasterEventLog } from '@/components/DisasterEventLog';
import { EarthGlobe } from '@/components/EarthGlobe';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coordinates, analyzeLocationAPI, AnalysisResult } from '@/lib/disaster-data';

type ViewMode = 'input' | 'analysis' | 'globe';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  const handleLocationSelect = async (coords: Coordinates, name: string) => {
    setIsAnalyzing(true);
    setLocationName(name);

    try {
      // Use API to analyze location
      const result = await analyzeLocationAPI(coords);
      setAnalysisResult(result);
      setViewMode('analysis');
    } catch (error) {
      console.error('Error analyzing location:', error);

    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setViewMode('input');
    setAnalysisResult(null);
    setLocationName('');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        

        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>


      <nav className="relative z-10 border-b border-border/50 backdrop-blur-md bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Globe2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Disaster Rescue</h1>
                <p className="text-xs text-muted-foreground">Global Disaster Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'input' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('input')}
                className="hidden md:flex"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Location
              </Button>
              <Button
                variant={viewMode === 'analysis' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('analysis')}
                disabled={!analysisResult}
                className="hidden md:flex"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Analysis
              </Button>
              <Button
                variant={viewMode === 'globe' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('globe')}
              >
                <Globe2 className="w-4 h-4 mr-1" />
                3D Globe
              </Button>
            </div>
          </div>
        </div>
      </nav>


      <main className="relative z-10">
        <AnimatePresence mode="wait">

          {viewMode === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-12 md:py-20"
            >

              <div className="text-center max-w-4xl mx-auto mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                >
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Real-time Disaster Intelligence</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-display font-bold mb-6"
                >
                  Know Your{' '}
                  <span className="gradient-text">Disaster Risks</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
                >
                  Analyze historical disaster patterns in your area. Get real-time alerts, 
                  risk assessments, and actionable safety recommendations.
                </motion.p>


                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-8 mb-12"
                >
                  {[
                    { value: '50km', label: 'Analysis Radius' },
                    { value: '10yr', label: 'Historical Data' },
                    { value: '6', label: 'Disaster Types' },
                    { value: 'Live', label: 'Global Monitoring' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-display font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <LocationInput onLocationSelect={handleLocationSelect} isLoading={isAnalyzing} />
              </motion.div>


              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
                  >
                    <GlassCard variant="strong" className="p-8 text-center">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-display font-semibold mb-2">Analyzing Location</h3>
                      <p className="text-muted-foreground">
                        Scanning disaster history for {locationName}...
                      </p>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
              >
                {[
                  {
                    icon: <MapPin className="w-6 h-6" />,
                    title: 'Location Analysis',
                    description: 'Analyze disaster history within 50km of any location worldwide',
                  },
                  {
                    icon: <BarChart3 className="w-6 h-6" />,
                    title: 'Risk Assessment',
                    description: 'Get detailed risk scores for earthquakes, floods, fires, and more',
                  },
                  {
                    icon: <Globe2 className="w-6 h-6" />,
                    title: '3D Visualization',
                    description: 'Explore global disasters on an interactive 3D Earth model',
                  },
                ].map((feature, index) => (
                  <GlassCard key={index} className="p-6 text-center" hover delay={0.7 + index * 0.1}>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </GlassCard>
                ))}
              </motion.div>
            </motion.div>
          )}


          {viewMode === 'analysis' && analysisResult && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    ← New Location
                  </Button>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Analysis Results</h2>
                    <p className="text-muted-foreground">{locationName}</p>
                  </div>
                </div>
                <Button onClick={() => setViewMode('globe')}>
                  <Globe2 className="w-4 h-4 mr-2" />
                  View 3D Globe
                </Button>
              </div>

              <Tabs defaultValue="map" className="space-y-6">
                <TabsList className="glass">
                  <TabsTrigger value="map">
                    <MapPin className="w-4 h-4 mr-1" />
                    Map View
                  </TabsTrigger>
                  <TabsTrigger value="stats">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Statistics
                  </TabsTrigger>
                  <TabsTrigger value="events">
                    <ScrollText className="w-4 h-4 mr-1" />
                    Event Log
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="space-y-6">
                  <DisasterMap
                    center={analysisResult.location.coordinates}
                    disasters={analysisResult.disasters}
                    nearbyCities={analysisResult.nearbyCities}
                  />
                  

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <GlassCard className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{analysisResult.disasters.length}</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <div className="text-2xl font-bold text-accent">{analysisResult.nearbyCities.length}</div>
                      <div className="text-sm text-muted-foreground">Cities in Range</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <div className="text-2xl font-bold text-risk-high">
                        {analysisResult.disasters.filter(d => d.isActive).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Events</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <div className="text-2xl font-bold text-risk-moderate">{analysisResult.stats.length}</div>
                      <div className="text-sm text-muted-foreground">Disaster Types</div>
                    </GlassCard>
                  </div>
                </TabsContent>

                <TabsContent value="stats">
                  <DisasterStatsComponent
                    stats={analysisResult.stats}
                    seasonalPatterns={analysisResult.seasonalPatterns}
                    overallRiskScore={analysisResult.overallRiskScore}
                    locationName={locationName}
                  />
                </TabsContent>

                <TabsContent value="events">
                  <DisasterEventLog
                    disasters={analysisResult.disasters}
                    locationName={locationName}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}


          {viewMode === 'globe' && (
            <motion.div
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold">Global Disaster Monitor</h2>
                  <p className="text-muted-foreground">Interactive 3D visualization of worldwide disasters</p>
                </div>
                <Button variant="ghost" onClick={() => setViewMode(analysisResult ? 'analysis' : 'input')}>
                  ← Back
                </Button>
              </div>

              <Suspense fallback={
                <GlassCard className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading 3D Globe...</p>
                  </div>
                </GlassCard>
              }>
                <EarthGlobe userLocation={analysisResult?.location.coordinates} />
              </Suspense>


              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-risk-high" />
                    <h3 className="font-semibold">Active Alerts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Highlighted markers show disasters that occurred in the last 30 days. 
                    Click any marker for detailed information.
                  </p>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Navigation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Drag to rotate the globe. Scroll to zoom in/out. 
                    Use filters to focus on specific disaster types.
                  </p>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Data Sources</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Data aggregated from GDACS, ReliefWeb, and NASA Earth Observatory 
                    for comprehensive global coverage.
                  </p>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      <footer className="relative z-10 border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold">Disaster Rescue</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Empowering communities with disaster intelligence for a safer world
            </p>
            <div className="text-sm text-muted-foreground">
              © 2026 Disaster Rescue
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
