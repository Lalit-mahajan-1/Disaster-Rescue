import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { DisasterStats as DisasterStatsType, SeasonalPattern, disasterConfig, DisasterType } from '@/lib/disaster-data';
import { AlertTriangle, TrendingUp, Calendar, Shield } from 'lucide-react';

interface DisasterStatsProps {
  stats: DisasterStatsType[];
  seasonalPatterns: SeasonalPattern[];
  overallRiskScore: number;
  locationName: string;
}

const DISASTER_COLORS: Record<DisasterType, string> = {
  earthquake: '#f59e0b',
  flood: '#0ea5e9',
  fire: '#ef4444',
  storm: '#a855f7',
  volcano: '#dc2626',
  tsunami: '#06b6d4',
};

export function DisasterStatsComponent({ stats, seasonalPatterns, overallRiskScore, locationName }: DisasterStatsProps) {
  const chartData = stats.map(s => {
    const config = disasterConfig[s.type] || disasterConfig['storm'];
    return {
      name: config.label,
      count: s.count,
      risk: s.riskScore,
      type: s.type,
    };
  });

  const pieData = stats.map(s => {
    const config = disasterConfig[s.type] || disasterConfig['storm'];
    return {
      name: config.label,
      value: s.count,
      type: s.type,
    };
  });

  const seasonalData = seasonalPatterns.map(p => ({
    month: p.month,
    disasters: p.disasters,
    color: DISASTER_COLORS[p.dominant],
  }));

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-risk-low';
    if (score <= 6) return 'text-risk-moderate';
    return 'text-risk-high';
  };

  const getRiskBgColor = (score: number) => {
    if (score <= 3) return 'bg-risk-low/20 border-risk-low/30';
    if (score <= 6) return 'bg-risk-moderate/20 border-risk-moderate/30';
    return 'bg-risk-high/20 border-risk-high/30';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Moderate Risk';
    return 'High Risk';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Risk Score Header */}
      <GlassCard variant="strong" className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-display font-bold mb-2">
              Risk Analysis: {locationName}
            </h2>
            <p className="text-muted-foreground">
              Based on historical disaster data within 50km radius
            </p>
          </div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className={`flex flex-col items-center p-6 rounded-xl border ${getRiskBgColor(overallRiskScore)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className={`w-5 h-5 ${getRiskColor(overallRiskScore)}`} />
              <span className="text-sm font-medium text-muted-foreground">Overall Risk</span>
            </div>
            <div className={`text-5xl font-display font-bold ${getRiskColor(overallRiskScore)}`}>
              {overallRiskScore}
              <span className="text-2xl text-muted-foreground">/10</span>
            </div>
            <span className={`text-sm font-medium mt-1 ${getRiskColor(overallRiskScore)}`}>
              {getRiskLabel(overallRiskScore)}
            </span>
          </motion.div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Frequency Bar Chart */}
        <GlassCard className="p-6" delay={0.1}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Disaster Frequency by Type</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="hsl(var(--muted-foreground))" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  fill="hsl(var(--primary))"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DISASTER_COLORS[entry.type as DisasterType]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Disaster Distribution Pie Chart */}
        <GlassCard className="p-6" delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Disaster Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={DISASTER_COLORS[entry.type as DisasterType]}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: DISASTER_COLORS[entry.type as DisasterType] }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Seasonal Patterns */}
        <GlassCard className="p-6 lg:col-span-2" delay={0.3}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Seasonal Disaster Patterns</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonalData}>
                <defs>
                  <linearGradient id="colorDisasters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="disasters" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorDisasters)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Risk by Disaster Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <GlassCard 
              className="p-4 text-center"
              hover
            >
              <div className="text-3xl mb-2">{(disasterConfig[stat.type] || disasterConfig['storm']).icon}</div>
              <h4 className="font-medium text-sm mb-1">{(disasterConfig[stat.type] || disasterConfig['storm']).label}</h4>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-xl font-bold ${getRiskColor(stat.riskScore)}`}>
                  {stat.riskScore}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.count} events
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
