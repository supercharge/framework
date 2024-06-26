
export interface StaticAssetsConfig {
  /**
   * Define the maximum amount of seconds to cache a static resource
   * using the `max-age` HTTP header. A cached item is allowed
   * to be reused until expired.
   */
  maxage: number

  /**
   * Determine whether to serve static assets afer running `return next()`
   * in the middleware stack. This allows downstream middleware to
   * respond first, before serving static assets.
   */
  defer: boolean

  /**
   * Determine whether to allow serving hidden files from the assets directory.
   */
  hidden: boolean

  /**
   * Serve an index file, like `index.html` from your static assets.
   */
  index: string | false | undefined
}
