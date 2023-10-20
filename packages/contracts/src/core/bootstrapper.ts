
import { Application } from '../index.js'

export type BootstrapperCtor =
  /**
   * Create a new bootstrapper instance.
   */
  new(app: Application) => Bootstrapper

export interface Bootstrapper {
  /**
   * Bootstrap the given application.
   */
  bootstrap(app: Application): Promise<void>
}
