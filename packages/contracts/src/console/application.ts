
export interface ConsoleApplication {
  /**
   * Runs the incoming console command for the given `input`.
   */
  run(input: string[]): Promise<any>
}
