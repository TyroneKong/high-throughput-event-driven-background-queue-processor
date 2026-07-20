import SystemMetrics from '../../../core/types/metrics';

const ActiveWorkersWidget = ({ metrics }: { metrics: SystemMetrics | null }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
      <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        Active Event Workers
      </div>
      <div className="flex items-baseline gap-2 mt-4">
        <span className="text-4xl font-bold tracking-tight">
          {metrics ? metrics.activeWorkers : '──'}
        </span>
        <span className="text-xs text-emerald-400 font-medium">Threads Operating</span>
      </div>
      <div className="text-xs text-slate-500 mt-5">Cluster nodes currently online and routing.</div>
    </div>
  );
};

export default ActiveWorkersWidget;
