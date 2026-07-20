'use client';

import { useState, useEffect } from 'react';

interface SystemMetrics {
  source: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  activeWorkers: number;
  backgroundJobsQueued: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:3000/catalog/metrics');
        if (!res.ok) throw new Error('Failed to retrieve server telemetries.');
        const data = await res.json();
        setMetrics(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Connection to backend dropped.');
      }
    };

    // Initial fetch and trigger immediate polling loop every 2 seconds
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, [isPolling]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Stream Status */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Infrastructure Monitor</h1>
            <p className="text-slate-400 mt-1 text-sm">Real-time cache performance and compute allocation telemetry.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button 
              onClick={() => setIsPolling(!isPolling)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isPolling 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {isPolling ? 'Pause Stream' : 'Resume Stream'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-300">
              <span className={`h-2 w-2 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isPolling ? 'Live Feed Active' : 'Feed Paused'}
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm">
            ⚠️ <strong>Cluster Connection Error:</strong> {error}
          </div>
        )}

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: CPU */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">CPU Processing Load</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold tracking-tight">{metrics ? `${metrics.cpuUsage}%` : '──'}</span>
            </div>
            <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-500 h-full transition-all duration-1000" 
                style={{ width: metrics ? `${metrics.cpuUsage}%` : '0%' }}
              />
            </div>
          </div>

          {/* Card 2: Memory */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">RAM Consumption</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold tracking-tight">{metrics ? `${metrics.memoryUsage} GB` : '──'}</span>
              <span className="text-xs text-slate-500">of 16 GB max</span>
            </div>
            <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-1000" 
                style={{ width: metrics ? `${(metrics.memoryUsage / 16) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Card 3: Active Workers */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Event Workers</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold tracking-tight">{metrics ? metrics.activeWorkers : '──'}</span>
              <span className="text-xs text-emerald-400 font-medium">Threads Operating</span>
            </div>
            <div className="text-xs text-slate-500 mt-5">Cluster nodes currently online and routing.</div>
          </div>

          {/* Card 4: Queue State */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Background Jobs Queued</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold tracking-tight text-amber-400">{metrics ? metrics.backgroundJobsQueued : '──'}</span>
              <span className="text-xs text-slate-400">Tasks Pending</span>
            </div>
            <div className="text-xs text-slate-500 mt-5">Asynchronous task load backpressure level.</div>
          </div>
        </div>

        {/* Engine Metadata Routing Summary Footer */}
        {metrics && (
          <footer className="mt-8 bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 gap-4">
            <div>
              <span className="font-semibold text-slate-300">Data Routing Source:</span>{' '}
              <span className={`px-2 py-0.5 rounded ml-1 font-mono font-medium ${
                metrics.source.includes('Cache') 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : metrics.source.includes('Mutex')
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {metrics.source}
              </span>
            </div>
            <div className="font-mono text-slate-500">
              Telemetry Sampled At: {new Date(metrics.timestamp).toLocaleTimeString()}
            </div>
          </footer>
        )}

      </div>
    </main>
  );
}
