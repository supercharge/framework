
export interface ConsoleKernel {
  /**
   * Prepare the console application by running the configured bootstrappers.
   * This method doesn’t register configured commands in the application.
   * It prepares the console application which is useful for testing.
   */
  prepare (): Promise<this>

  /**
   * Bootstrap the console application to handle Craft commands.
   */
  bootstrap(): Promise<void>

  /**
   * Handle an incoming console command for the given `input`.
   */
  run(input?: string[]): Promise<any>
}
