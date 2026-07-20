type HeaderProps = {
  isPolling: boolean;
  setIsPolling: (value: boolean) => void;
};

const Header = ({ isPolling, setIsPolling }: HeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Infrastructure Monitor</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Real-time cache performance and compute allocation telemetry.
        </p>
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
          <span
            className={`h-2 w-2 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
          />
          {isPolling ? 'Live Feed Active' : 'Feed Paused'}
        </div>
      </div>
    </header>
  );
};

export default Header;
