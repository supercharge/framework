
import Path from 'node:path'
import { AddressInfo } from 'node:net'
import { Str } from '@supercharge/strings'
import { HotReloadFile } from './hotfile.js'
import { DevServerUrl, PluginConfigContract } from './types.js'
import { ConfigEnv, Plugin, ResolvedConfig, UserConfig, ViteDevServer } from 'vite'

/**
 * Supercharge plugin for Vite.
 */
export function supercharge (config: string | string[] | PluginConfigContract): Plugin {
  const pluginConfig = resolvePluginConfig(config)

  return resolveSuperchargePlugin(pluginConfig)
}

/**
 * Returns the validated plugin configuration, with default values where necessary.
 */
function resolvePluginConfig (config: string | string[] | PluginConfigContract): Required<PluginConfigContract> {
  if (!config) {
    throw new Error('supercharge-vite-plugin: missing inputs or configuration')
  }

  if (typeof config === 'string') {
    config = [config]
  }

  if (Array.isArray(config)) {
    config = { input: config }
  }

  if (!config.input) {
    throw new Error('supercharge-vite-plugin: missing "input" configuration')
  }

  if (typeof config.publicDirectory === 'string') {
    config.publicDirectory = Str(config.publicDirectory).trim().ltrim('/').get()

    if (config.publicDirectory === '') {
      throw new Error('supercharge-vite-plugin: the "publicDirectory" option must be a subdirectory, like "public"')
    }
  }

  if (typeof config.buildDirectory === 'string') {
    config.buildDirectory = Str(config.buildDirectory).trim().ltrim('/').rtrim('/').get()

    if (config.buildDirectory === '') {
      throw new Error('supercharge-vite-plugin: the "buildDirectory" option must be a subdirectory, like "build"')
    }
  }

  if (typeof config.ssrOutputDirectory === 'string') {
    config.ssrOutputDirectory = Str(config.ssrOutputDirectory).trim().ltrim('/').rtrim('/').get()

    if (config.ssrOutputDirectory === '') {
      throw new Error('supercharge-vite-plugin: the "ssrOutputDirectory" option must be a subdirectory, like "ssr"')
    }
  }

  const publicDirectory = config.publicDirectory ?? 'public'
  const buildDirectory = config.buildDirectory ?? 'build'

  return {
    input: config.input,
    publicDirectory,
    buildDirectory,
    ssr: config.ssr ?? config.input,
    ssrOutputDirectory: config.ssrOutputDirectory ?? 'bootstrap/ssr',
    hotFilePath: config.hotFilePath ?? Path.join(publicDirectory, buildDirectory, '.vite', 'hot.json'),
  }
}

/**
 * Returns the resolved Supercharge plugin config.
 */
function resolveSuperchargePlugin (pluginConfig: Required<PluginConfigContract>): Plugin {
  let viteDevServerUrl: DevServerUrl
  let resolvedConfig: ResolvedConfig

  return {
    name: 'supercharge',
    enforce: 'post',

    /**
     * Hook into the Vite configuration before it is resolved. This adjusts the
     * configuration for a project using the Supercharge directory structure.
     */
    config (userConfig: UserConfig, { command }: ConfigEnv): UserConfig {
      const isSsrBuild = !!userConfig.build?.ssr

      return {
        base: userConfig.base ?? (command === 'build' ? resolveBase(pluginConfig) : '/'),

        publicDir: userConfig.publicDir ?? false,

        build: {
          manifest: !isSsrBuild,
          outDir: userConfig.build?.outDir ?? resolveOutDir(pluginConfig, isSsrBuild),
          rollupOptions: {
            input: userConfig.build?.rollupOptions?.input ?? resolveInput(pluginConfig, isSsrBuild)
          },
          assetsInlineLimit: userConfig.build?.assetsInlineLimit ?? 0,
        },

        server: {
          origin: '__supercharge_vite_placeholder__',
          ...userConfig.server
        },

        ssr: {
          noExternal: noExternalInertiaHelpers(userConfig),
        },
      }
    },

    /**
     * This hook stores the final, resolved Vite config.
     */
    configResolved (config) {
      resolvedConfig = config
    },

    /**
     * Hook into Vite’s code transform lifecycle setp.
     */
    transform (code: string) {
      if (resolvedConfig.command !== 'serve') {
        return
      }

      return Str(code)
        .replaceAll('__supercharge_vite_placeholder__', viteDevServerUrl)
        .get()
    },

    /**
     * Configure the Vite server.
     */
    configureServer (server: ViteDevServer) {
      const hotfile = new HotReloadFile(
        Path.join(resolvedConfig.root, pluginConfig.hotFilePath)
      )

      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address()

        if (isAddressInfo(address)) {
          viteDevServerUrl = resolveDevServerUrl(address, server.config)
          hotfile.writeFileSync({ viteDevServerUrl })
        }
      })
    }
  }
}

/**
 * Returns the resolved base option based on the build directory.
 */
function resolveBase (pluginConfig: Required<PluginConfigContract>): string {
  return `/${pluginConfig.buildDirectory}/`
}

/**
 * Returns the output path for the compiled assets.
 */
function resolveOutDir (pluginConfig: Required<PluginConfigContract>, useSsr: boolean): string {
  const { publicDirectory, buildDirectory, ssrOutputDirectory } = pluginConfig

  return useSsr
    ? ssrOutputDirectory
    : Path.join(publicDirectory, buildDirectory)
}

/**
 * Returns the input path for the Vite configuration.
 */
function resolveInput (pluginConfig: Required<PluginConfigContract>, useSsr: boolean): string | string[] | undefined {
  return useSsr
    ? pluginConfig.ssr
    : pluginConfig.input
}

/**
 * Determine whether the given `address` is an `AddressInfo` object.
 */
function isAddressInfo (address: string | AddressInfo | null | undefined): address is AddressInfo {
  return typeof address === 'object'
}

/**
 * Returns the resolved Vite dev server URL.
 */
function resolveDevServerUrl (address: AddressInfo, config: ResolvedConfig): DevServerUrl {
  return `${protocol(config)}://${host(address, config)}:${port(address, config)}`
}

/**
 * Returns the dev server protocol.
 */
function protocol (config: ResolvedConfig): 'http' | 'https' {
  return clientProtocol(config) ?? serverProtocol(config)
}

/**
 * Returns the client protocol.
 */
function clientProtocol (config: ResolvedConfig): 'https' | 'http' | undefined {
  const configHmrProtocol = typeof config.server.hmr === 'object'
    ? config.server.hmr.protocol
    : null

  if (!configHmrProtocol) {
    return
  }

  return configHmrProtocol === 'wss'
    ? 'https'
    : 'http'
}

/**
 * Returns the server protocol.
 */
function serverProtocol (config: ResolvedConfig): 'https' | 'http' {
  return config.server.https
    ? 'https'
    : 'http'
}

/**
 * Returns the server’s host address.
 */
function host (address: AddressInfo, config: ResolvedConfig): string {
  const configHmrHost = typeof config.server.hmr === 'object'
    ? config.server.hmr.host
    : null

  const configHost = typeof config.server.host === 'string'
    ? config.server.host
    : null

  const serverAddress = isIpv6(address)
    ? `[${address.address}]`
    : address.address

  return configHmrHost ?? configHost ?? serverAddress
}

/**
 * Determine whether the given `address` uses an IPv6 address.
 */
function isIpv6 (address: AddressInfo): boolean {
  if (typeof address.family === 'string') {
    return address.family === 'IPv6'
  }

  // In Node.js >=18.0 <18.4 this was an integer value. This was changed in a minor version.
  return address.family === 6
}

/**
 * Returns the server’s port.
 */
function port (address: AddressInfo, config: ResolvedConfig): number {
  const configHmrPort = typeof config.server.hmr === 'object'
    ? config.server.hmr.clientPort
    : null

  return configHmrPort ?? address.port
}

/**
 * Returns the values for Vite’s `ssr.noExternal` configuration option.
 */
function noExternalInertiaHelpers (userConfig: UserConfig): true | Array<string | RegExp> {
  const userNoExternal = (userConfig.ssr)?.noExternal
  const pluginNoExternal = ['supercharge-vite-plugin']

  if (userNoExternal === true) {
    return true
  }

  if (userNoExternal == null) {
    return pluginNoExternal
  }

  return ([] as Array<string | RegExp>)
    .concat(userNoExternal)
    .concat(pluginNoExternal)
}
