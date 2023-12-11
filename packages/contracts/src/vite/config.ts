
export interface ViteConfig {
  /**
   * Stores the URL used as a prefix when creating asset URLs. This could be a
   * CDN URL for production builds. If empty, the created asset URL starts
   * with a leading slash to serve it locally from the running server.
   *
   * @default `/build`
   */
  assetsUrl?: string

  /**
   * Stores the path to the hot-reload file, relative from the application’s base directory.
   *
   * @default `<assetsUrl>/.vite/hot.json`
   */
  hotReloadFilePath?: string

  /**
   * Stores the Vite manifest file path, relative from the application’s base directory.
   *
   * @default `<assetsUrl>/.vite/manifest.json`
   */
  manifestFilePath?: string

  /**
   * Stores an object of attributes to apply on all HTML `script` tags.
   *
   * @default `{}`
   */
  scriptAttributes?: Record<string, string | boolean>

  /**
   * Stores an object of attributes to apply on all HTML `style` tags.
   *
   * @default `{}`
   */
  styleAttributes?: Record<string, string | boolean>
}
