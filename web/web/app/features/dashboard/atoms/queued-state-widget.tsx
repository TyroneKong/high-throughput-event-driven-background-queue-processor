import SystemMetrics from '@/app/core/types/metrics';

const QueuedStateWidget = ({ metrics }: { metrics: SystemMetrics | null }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/60 shadow-xl">
      <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        Background Jobs Queued
      </div>
      <div className="flex items-baseline gap-2 mt-4">
        <span className="text-4xl font-bold tracking-tight text-amber-400">
          {metrics ? metrics.backgroundJobsQueued : '──'}
        </span>
        <span className="text-xs text-slate-400">Tasks Pending</span>
      </div>
      <div className="text-xs text-slate-500 mt-5">Asynchronous task load backpressure level.</div>
    </div>
  );
};

export default QueuedStateWidget;
