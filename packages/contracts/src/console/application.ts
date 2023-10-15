
export interface ConsoleApplication {
  /**
   * Runs the incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (argv)
   *
   * @returns {Promise}
   */
  run(input: string[]): Promise<any>
}
