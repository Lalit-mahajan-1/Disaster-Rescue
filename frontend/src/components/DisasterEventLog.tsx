import { motion } from 'framer-motion';
import { Calendar, MapPin, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Disaster, disasterConfig } from '@/lib/disaster-data';
import { format } from 'date-fns';

interface DisasterEventLogProps {
  disasters: Disaster[];
  locationName: string;
}

export function DisasterEventLog({ disasters, locationName }: DisasterEventLogProps) {
  // Sort disasters by date (most recent first)
  const sortedDisasters = [...disasters].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'text-risk-high';
    if (severity >= 3) return 'text-risk-moderate';
    return 'text-risk-low';
  };

  const getSeverityBadge = (severity: number) => {
    if (severity >= 4) return 'destructive';
    if (severity >= 3) return 'default';
    return 'secondary';
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ['', 'Minor', 'Moderate', 'Significant', 'Major', 'Catastrophic'];
    return labels[severity] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold">Event Log</h3>
          <p className="text-muted-foreground">
            Historical disaster events near {locationName}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {disasters.length} Events
        </Badge>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sortedDisasters.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No disaster events found in this area</p>
          </GlassCard>
        ) : (
          sortedDisasters.map((disaster, index) => (
            <motion.div
              key={disaster.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-5 hover:border-primary/50 transition-all">
                <div className="flex gap-4">
                  {/* Icon & Timeline Line */}
                  <div className="flex flex-col items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${(disasterConfig[disaster.type] || disasterConfig['storm']).color}20` }}
                      >
                        {(disasterConfig[disaster.type] || disasterConfig['storm']).icon}
                      </div>
                    {index < sortedDisasters.length - 1 && (
                      <div className="w-0.5 h-full bg-border/50 mt-2" />
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-3">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {disaster.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={getSeverityBadge(disaster.severity)}>
                            {getSeverityLabel(disaster.severity)} (Level {disaster.severity})
                          </Badge>
                          {disaster.isActive && (
                            <Badge variant="destructive" className="animate-pulse">
                              🔴 Active
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {(disasterConfig[disaster.type] || disasterConfig['storm']).label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Location & Date */}
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>
                          <strong className="text-foreground">{disaster.city}</strong>
                          {disaster.country && `, ${disaster.country}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong className="text-foreground">
                            {format(disaster.date, 'MMMM dd, yyyy')}
                          </strong>
                          {' '}({format(disaster.date, 'h:mm a')})
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {disaster.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {disaster.description}
                      </p>
                    )}

                    {/* Impact Statistics */}
                    {(disaster.casualties || disaster.damageEstimate) && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {disaster.casualties && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-risk-high" />
                            <span className="text-muted-foreground">
                              Casualties: <strong className="text-foreground">{disaster.casualties}</strong>
                            </span>
                          </div>
                        )}
                        {disaster.damageEstimate && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Damage: <strong className="text-foreground">{disaster.damageEstimate}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Coordinates */}
                    <div className="text-xs text-muted-foreground font-mono bg-secondary/30 px-3 py-2 rounded">
                      📍 Coordinates: {disaster.location.lat.toFixed(4)}°N, {disaster.location.lng.toFixed(4)}°E
                    </div>

                    {/* Data Source Citation */}
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        <span>
                          Data Source: <strong className="text-foreground">
                            {disaster.id.startsWith('nasa') ? 'NASA EONET' : 
                             disaster.id.startsWith('reliefweb') ? 'ReliefWeb (UN)' : 
                             disaster.id.startsWith('gdacs') ? 'GDACS' : 
                             'Historical Database'}
                          </strong>
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>Event ID: {disaster.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {sortedDisasters.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>
                Showing {sortedDisasters.length} disaster events from the past 10 years
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                Latest: <strong className="text-foreground">
                  {format(sortedDisasters[0].date, 'MMM dd, yyyy')}
                </strong>
              </span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
