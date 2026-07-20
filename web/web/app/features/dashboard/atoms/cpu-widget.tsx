import SystemMetrics from '@/app/core/types/metrics';

const CPUWidget = ({ metrics }: { metrics: SystemMetrics | null }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
      <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        CPU Processing Load
      </div>
      <div className="flex items-baseline gap-2 mt-4">
        <span className="text-4xl font-bold tracking-tight">
          {metrics ? `${metrics.cpuUsage}%` : '──'}
        </span>
      </div>
      <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-sky-500 h-full transition-all duration-1000"
          style={{ width: metrics ? `${metrics.cpuUsage}%` : '0%' }}
        />
      </div>
    </div>
  );
};

export default CPUWidget;
