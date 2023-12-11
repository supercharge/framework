
export class InertiaPageNotFoundError extends Error {
  /**
   * Create a new instance.
   */
  constructor (path: string) {
    super(`Inertia page not found: ${path}`)

    this.name = 'InertiaPageNotFoundError'
    InertiaPageNotFoundError.captureStackTrace(this, this.constructor)
  }
}
