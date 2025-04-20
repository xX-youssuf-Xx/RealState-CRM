import cron from 'node-cron';

export class CronService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Schedule a function to run every 30 minutes
   * @param name - Unique identifier for the job
   * @param fn - Function to execute
   * @returns boolean indicating if the job was scheduled successfully
   */
  static scheduleEvery30Minutes(name: string, fn: () => void | Promise<void>): boolean {
    try {
      // Check if job already exists
      if (this.jobs.has(name)) {
        console.warn(`Job with name "${name}" already exists. Stopping previous job.`);
        this.stopJob(name);
      }

      // Schedule the job to run every 5 minutes
      const job = cron.schedule('*/5 * * * *', async () => {
        try {
          console.log(`[${new Date().toISOString()}] Executing job: ${name}`);
          await fn();
        } catch (error) {
          console.error(`Error executing job ${name}:`, error);
        }
      });

      // Store the job
      this.jobs.set(name, job);
      console.log(`Successfully scheduled job: ${name}`);
      return true;
    } catch (error) {
      console.error(`Failed to schedule job ${name}:`, error);
      return false;
    }
  }

  /**
   * Stop a scheduled job
   * @param name - Name of the job to stop
   */
  static stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`Stopped job: ${name}`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  static stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get all active job names
   * @returns Array of job names
   */
  static getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}
