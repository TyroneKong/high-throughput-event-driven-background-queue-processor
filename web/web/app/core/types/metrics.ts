type SystemMetrics = {
  source: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  activeWorkers: number;
  backgroundJobsQueued: number;
}

export default SystemMetrics;
