'use strict'

import Fs from 'fs'
import Path from 'path'
import { AddressInfo } from 'net'
import Str from '@supercharge/strings'
import { DevServerUrl, PluginConfigContract } from './contracts/plugin'
import { ConfigEnv, Plugin, ResolvedConfig, UserConfig, ViteDevServer } from 'vite'

export class SuperchargePlugin implements Plugin {
  /**
   * Stores the resolved, validated plugin configuration.
   */
  private readonly pluginConfig: Required<PluginConfigContract>

  /**
   * Stores the finaly, resolved Vite config.
   */
  private resolvedConfig?: ResolvedConfig

  /**
   * Stores the path to the hot-reload file.
   */
  private readonly hotFilePath: string

  /**
   * Stores the Vite server URL.
   */
  private viteDevServerUrl!: DevServerUrl

  /**
   * Create a new instance.
   */
  constructor (config: string | string[] | PluginConfigContract) {
    this.pluginConfig = this.validated(config)
    this.hotFilePath = Path.join(this.pluginConfig.publicDirectory, 'hot')
  }

  /**
   * Returns the validated plugin configuration, with default values where necessary.
   *
   * @param config The user configuration.
   *
   * @returns {Required<PluginConfigContract>}
   */
  validated (config: string | string[] | PluginConfigContract): Required<PluginConfigContract> {
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
        throw new Error('supercharge-vite-plugin: the publicDirectory option must be a subdirectory, like "public"')
      }
    }

    if (typeof config.buildDirectory === 'string') {
      config.buildDirectory = Str(config.buildDirectory).trim().ltrim('/').rtrim('/').get()

      if (config.buildDirectory === '') {
        throw new Error('supercharge-vite-plugin: the buildDirectory option must be a subdirectory, like "build"')
      }
    }

    return {
      input: config.input,
      buildDirectory: config.buildDirectory ?? 'build',
      publicDirectory: config.publicDirectory ?? 'public',
    }
  }

  /**
   * Returns the plugin name
   */
  get name (): string {
    return 'supercharge'
  }

  /**
   * Enforce plugin invocation after vite ran other and it’s build plugins.
   */
  get enforce (): Plugin['enforce'] {
    return 'post'
  }

  /**
   * This hook stores the final, resolved Vite config.
   */
  configResolved (resolvedConfig: ResolvedConfig): void {
    this.resolvedConfig = resolvedConfig
  }

  /**
   * Hook into the Vite configuration before it is resolved. This adjusts the
   * configuration for a project using the Supercharge directory structure.
   */
  config (userConfig: UserConfig, { command }: ConfigEnv): UserConfig {
    return {
      base: command === 'build' ? this.resolveBase() : '',
      publicDir: false,
      build: {
        manifest: true,
        outDir: userConfig.build?.outDir ?? this.resolveOutDir(),
        rollupOptions: {
          input: userConfig.build?.rollupOptions?.input ?? this.pluginConfig.input
        },
      },
      server: {
        origin: '__supercharge_vite_placeholder__',
        host: 'localhost',
      }
    }
  }

  /**
   * Returns the resolved base option based on the build directory.
   *
   * @returns {string}
   */
  resolveBase (): string {
    return `/${this.pluginConfig.buildDirectory}/`
  }

  /**
   * Returns the output path for the compiled assets.
   *
   * @returns {string}
   */
  resolveOutDir (): string {
    return Path.join(this.pluginConfig.publicDirectory, this.pluginConfig.buildDirectory)
  }

  /**
   * Hook into Vite’s code transform lifecycle setp.
   */
  transform (code: string): string | undefined {
    if (this.resolvedConfig?.command === 'serve') {
      return code.replace(/__supercharge_vite_placeholder__/g, this.viteDevServerUrl)
    }
  }

  /**
   * Configure the Vite server.
   */
  configureServer (server: ViteDevServer): void {
    server.httpServer?.once('listening', () => {
      const address = server.httpServer?.address()

      if (this.isAddressInfo(address)) {
        this.writeHotFileFor(address)
      }
    })

    process.on('SIGINT', process.exit)
    process.on('SIGHUP', process.exit)
    process.on('SIGTERM', process.exit)
    process.on('exit', () => this.deleteHotFile())
  }

  /**
   * Determine whether the given `address` is an `AddressInfo` object.
   */
  isAddressInfo (address: string | AddressInfo | null | undefined): address is AddressInfo {
    return typeof address === 'object'
  }

  /**
   * Write a hot-reload file for the given `address`.
   */
  writeHotFileFor (address: AddressInfo): void {
    this.viteDevServerUrl = this.resolveDevServerUrl(address)
    Fs.writeFileSync(this.hotFilePath, this.viteDevServerUrl)
  }

  /**
   * Delete a possibly existing hot-reload file.
   */
  deleteHotFile (): void {
    if (Fs.existsSync(this.hotFilePath)) {
      Fs.rmSync(this.hotFilePath)
    }
  }

  /**
   * Returns the resolved Vite dev server URL.
   */
  resolveDevServerUrl (address: AddressInfo): DevServerUrl {
    return `${this.protocol()}://${this.host(address)}:${address.port}`
  }

  /**
   * Returns the dev server protocol.
   */
  protocol (): 'http' | 'https' {
    return this.clientProtocol() ?? this.serverProtocol()
  }

  /**
   * Returns the client protocol.
   */
  clientProtocol (): 'https' | 'http' | undefined {
    const configHmrProtocol = this.resolvedConfig?.server.hmr === 'object'
      ? this.resolvedConfig.server.hmr.protocol
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
  serverProtocol (): 'https' | 'http' {
    return this.resolvedConfig?.server.https
      ? 'https'
      : 'http'
  }

  /**
   * Returns the server’s host address.
   */
  host (address: AddressInfo): string {
    const configHmrHost = typeof this.resolvedConfig?.server.hmr === 'object'
      ? this.resolvedConfig.server.hmr.host
      : null

    const configHost = typeof this.resolvedConfig?.server.host === 'string'
      ? this.resolvedConfig.server.host
      : null

    const serverAddress = address.family === 'IPv6'
      ? `[${address.address}]`
      : address.address

    return configHmrHost ?? configHost ?? serverAddress
  }

  /**
   * Determine whether the given `address` uses an IPv6 address.
   */
  isIpv6 (address: AddressInfo): boolean {
    if (typeof address.family === 'string') {
      return address.family === 'IPv6'
    }

    // In Node.js >=18.0 <18.4 this was an integer value. This was changed in a minor version.
    return address.family === 6
  }
}
