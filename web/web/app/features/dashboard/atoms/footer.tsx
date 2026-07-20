import SystemMetrics from '@/app/core/types/metrics';

const Footer = ({ metrics }: { metrics: SystemMetrics }) => {
  return (
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
  );
};

export default Footer;
