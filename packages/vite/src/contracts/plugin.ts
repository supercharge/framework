
export interface PluginConfigContract {
  /**
   * The path or paths to the entrypoints to compile with Vite.
   */
  input: string | string[]

  /**
   * The "public" directory name.
   *
   * @default "public"
   */
  publicDirectory?: string

  /**
   * The "build" subdirectory name where compiled assets should be written.
   *
   * @default "build"
   */
  buildDirectory?: string

  /**
   * The SSR entry point path(s).
   */
  ssr?: string | string[]

  /**
   * The hot-reload file path.
   *
   * @default "${publicDirectory}/'hot')"
   */
  hotFilePath?: string

  /**
   * The directory where the SSR bundle should be written.
   *
   * @default 'bootstrap/ssr'
   */
  ssrOutputDirectory?: string
}

export type DevServerUrl = `${'http' | 'https'}://${string}:${number}`
