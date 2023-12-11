
import Path from 'node:path'
import { Str } from '@supercharge/strings'
import { ViteConfig as ViteConfigContract } from '@supercharge/contracts'

export class ViteConfig {
  /**
   * Stores the Vite config object.
   */
  private readonly config: Required<ViteConfigContract>

  /**
   * Create a new instance.
   */
  constructor (config: ViteConfigContract) {
    this.config = this.createConfigFrom(config ?? {})
  }

  /**
   * Returns a new instance for the given Vite `config`.
   */
  static from (config: ViteConfigContract): ViteConfig {
    return new this(config)
  }

  /**
   * Returns the resolved Vite config.
   */
  private createConfigFrom (config: Partial<ViteConfigContract> = {}): Required<ViteConfigContract> {
    const assetsUrl = Str(
      this.isCdnUrl(config.assetsUrl)
        ? config.assetsUrl
        : Str(config.assetsUrl ?? '/build')
          .ltrim('/')
          .start('/')
    )
      .rtrim('/')
      .get()

    return {
      assetsUrl,
      hotReloadFilePath: config.hotReloadFilePath ?? Path.join(assetsUrl, '/.vite/hot.json'),
      manifestFilePath: config.manifestFilePath ?? Path.join(assetsUrl, '.vite/manifest.json'),
      styleAttributes: { ...config.styleAttributes },
      scriptAttributes: { ...config.scriptAttributes },
    }
  }

  /**
   * Determine whether the given `assetsUrl` is a full URL.
   */
  private isCdnUrl (assetsUrl: ViteConfigContract['assetsUrl']): assetsUrl is string {
    if (!assetsUrl) {
      return false
    }

    try {
      const url = new URL(assetsUrl)

      return url.protocol.startsWith('http')
    } catch (error) {
      return false
    }
  }

  /**
   * Returns the Vite config object.
   */
  toJSON (): ViteConfigContract {
    return {
      assetsUrl: this.assetsUrl(),
      hotReloadFilePath: this.hotReloadFilePath(),
      manifestFilePath: this.manifestFilePath(),
      styleAttributes: this.styleAttributes(),
      scriptAttributes: this.scriptAttributes(),
    }
  }

  /**
   * Returns the Vite hot-reload file path. The hot-reload file contains the Vite dev server URL.
   */
  hotReloadFilePath (): string {
    return this.config.hotReloadFilePath
  }

  /**
   * Returns the Vite manifest file path.
   */
  manifestFilePath (): string {
    return this.config.manifestFilePath
  }

  /**
   * Returns the assets URL.
   */
  assetsUrl (): string {
    return this.config.assetsUrl
  }

  /**
   * Returns the default attributes assigned to every `script` tag.
   */
  scriptAttributes (): ViteConfigContract['scriptAttributes'] {
    return this.config.scriptAttributes
  }

  /**
   * Returns the default attributes assigned to every `style` tag.
   */
  styleAttributes (): ViteConfigContract['styleAttributes'] {
    return this.config.styleAttributes
  }
}
