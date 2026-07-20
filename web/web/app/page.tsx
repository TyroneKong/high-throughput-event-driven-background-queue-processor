'use client';

import Header from './features/dashboard/atoms/header';
import { useState, useEffect } from 'react';
import SystemMetrics from './core/types/metrics';
import CPUWidget from './features/dashboard/atoms/cpu-widget';
import MemoryWidget from './features/dashboard/atoms/memory-widget';
import ActiveWorkersWidget from './features/dashboard/atoms/active-workers-widget';
import QueuedStateWidget from './features/dashboard/atoms/queued-state-widget';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:3002/catalog/metrics');
        if (!res.ok) throw new Error('Failed to retrieve server telemetries.');
        const data = await res.json();
        setMetrics(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Connection to backend dropped.');
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
        <Header isPolling={isPolling} setIsPolling={setIsPolling} />

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm">
            ⚠️ <strong>Cluster Connection Error:</strong> {error}
          </div>
        )}

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: CPU */}
          <CPUWidget metrics={metrics} />

          {/* Card 2: Memory */}
          <MemoryWidget metrics={metrics} />

          {/* Card 3: Active Workers */}
          <ActiveWorkersWidget metrics={metrics} />

          {/* Card 4: Queue State */}
          <QueuedStateWidget metrics={metrics} />
        </div>

        {/* Engine Metadata Routing Summary Footer */}
        {metrics && (
          <footer className="mt-8 bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 gap-4">
            <div>
              <span className="font-semibold text-slate-300">Data Routing Source:</span>{' '}
              <span
                className={`px-2 py-0.5 rounded ml-1 font-mono font-medium ${
                  metrics.source.includes('Cache')
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : metrics.source.includes('Mutex')
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
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
