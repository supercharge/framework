'use strict'

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
}

export type DevServerUrl = `${'http' | 'https'}://${string}:${number}`
