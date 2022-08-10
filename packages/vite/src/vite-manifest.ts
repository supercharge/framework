'use strict'

import Fs from 'node:fs'
import { Manifest, ManifestChunk } from 'vite'

export class ViteManifest {
  /**
   * Stores the Vite manifest object.
   */
  private readonly manifest: Manifest

  /**
   * Create a new instance.
   */
  constructor (manifest: Manifest) {
    this.manifest = manifest
  }

  /**
   * Generate HTML tags for the given `entrypoints`.
   *
   * @param entrypoints The entrypoints to handle.
   * @param buildDirectory
   *
   * @returns {Vite}
   */
  static loadFrom (manifestPath: string): ViteManifest {
    this.ensureManifestExists(manifestPath)

    const manifest = JSON.parse(
      Fs.readFileSync(manifestPath, 'utf8')
    )

    return new this(manifest)
  }

  /**
   * Ensure the Vite manifest file exists.
   */
  static ensureManifestExists (manifestPath: string): void {
    if (!Fs.existsSync(manifestPath)) {
      throw new Error(`Vite manifest file not found at: ${manifestPath} `)
    }
  }

  /**
   * Ensure the given `entrypoint` exists in the manifest.
   *
   * @param entrypoint
   */
  ensureEntrypoint (entrypoint: string): void {
    if (!this.hasEntrypoint(entrypoint)) {
      throw new Error(`Entrypoint not found in manifest: ${entrypoint}`)
    }
  }

  /**
   * Determine whether the given `entrypoint` exists in the manifest.
   *
   * @param entrypoint
   *
   * @returns {Boolean}
   */
  hasEntrypoint (entrypoint: string): boolean {
    return !!this.getChunk(entrypoint)
  }

  /**
   * Returns the manifest chunk for the given `entrypoint`.
   *
   * @param entrypoint
   *
   * @returns {ManifestChunk | undefined}
   */
  getChunk (entrypoint: string): ManifestChunk | undefined {
    return this.manifest[entrypoint]
  }
}
