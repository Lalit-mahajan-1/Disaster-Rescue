import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Lightbulb, Shield, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

interface DisasterSuggestionsProps {
  location: string;
  disasterType: string;
}

export function DisasterSuggestions({ location, disasterType }: DisasterSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8000/api/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: location,
            disaster_type: disasterType,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        setError('Unable to load AI suggestions at this time.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (location && disasterType) {
      fetchSuggestions();
    }
  }, [location, disasterType]);

  return (
    <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">AI Safety Guidelines</h3>
            <p className="text-xs text-muted-foreground">Generated for {disasterType} in {location}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[500px] flex-1 px-6 pb-6">
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm animate-pulse">Consulting AI Knowledge Base...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 text-sm p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-foreground/90">{suggestion}</span>
                </motion.div>
              ))}
              
              <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 flex items-start gap-2">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>These suggestions are AI-generated based on general safety protocols. Always follow instructions from local authorities and emergency services.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
