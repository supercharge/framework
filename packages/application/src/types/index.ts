
import { PackageJson } from 'type-fest'
import { Arr } from '@supercharge/arrays'
import { Application, ConfigStore, EnvStore, ServiceProvider } from '@supercharge/contracts'

export type Callback = (app: Application) => unknown | Promise<unknown>

export interface ApplicationMeta {
  /**
   * The absolute path to the application’s root directory.
   */
  appRoot: string

  /**
   * The config store instance.
   */
  config: ConfigStore

  /**
   * The env store instance.
   */
  env: EnvStore

  /**
   * The environment file to load during application bootstrapping.
   */
  environmentFile: string

  /**
   * The directory for the environment file.
   */
  environmentPath?: string

  /**
   * Indicate whether the application runs in the console.
   */
  isRunningInConsole: boolean

  /**
   * All booting callbacks.
   */
  bootingCallbacks: Callback[]

  /**
   * All registered service providers.
   */
  serviceProviders: Arr<ServiceProvider>

  /**
   * The the application’s `package.json` content.
   */
  packageJson: PackageJson | undefined
}
