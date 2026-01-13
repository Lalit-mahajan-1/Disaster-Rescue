import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { disastersAPI, locationAPI } from '@/lib/api';

export function APIConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing backend connection...');
    setDetails(null);

    try {
      // Test 1: Health check
      const healthResponse = await fetch('http://localhost:5000/health');
      if (!healthResponse.ok) {
        throw new Error('Backend health check failed');
      }
      const healthData = await healthResponse.json();

      // Test 2: Get disaster statistics
      const statsResponse = await disastersAPI.getStatistics();
      
      // Test 3: Get active disasters
      const activeResponse = await disastersAPI.getActiveDisasters();

      setStatus('success');
      setMessage('✅ Backend connection successful!');
      setDetails({
        health: healthData,
        stats: statsResponse.data,
        activeDisasters: activeResponse.data.count,
      });
    } catch (error: any) {
      setStatus('error');
      setMessage('❌ Backend connection failed');
      setDetails({
        error: error.message,
        suggestion: 'Make sure the backend server is running on http://localhost:5000',
      });
    }
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Backend Connection Test</h3>
      
      <div className="space-y-4">
        <Button
          onClick={testConnection}
          disabled={status === 'testing'}
          className="w-full"
        >
          {status === 'testing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Backend Connection
            </>
          )}
        </Button>

        {status !== 'idle' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
              {status === 'testing' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
              <span className="font-medium">{message}</span>
            </div>

            {details && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Expected Backend URL:</strong> http://localhost:5000</p>
          <p><strong>Current Environment:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not configured'}</p>
        </div>
      </div>
    </GlassCard>
  );
}
