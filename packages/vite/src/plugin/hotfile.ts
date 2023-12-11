
import Fs from 'node:fs'
import Path from 'node:path'
import { HotReloadFileContent } from './types.js'

export class HotReloadFile {
  /**
   * Stores the Vite config object.
   */
  private readonly hotfilePath: string

  /**
   * Create a new instance.
   */
  constructor (hotfilePath: string) {
    this.hotfilePath = hotfilePath
    this.deleteHotfileOnProcessExit()
  }

  /**
   * Returns a new instance for the given hot-reload file path.
   */
  static from (hotfilePath: string): HotReloadFile {
    return new this(hotfilePath)
  }

  /**
   * Clean-up the hot-reload file when exiting the process.
   */
  private deleteHotfileOnProcessExit (): void {
    process.on('exit', () => this.deleteHotfile())
    process.on('SIGINT', process.exit)
    process.on('SIGHUP', process.exit)
    process.on('SIGTERM', process.exit)
  }

  /**
   * Delete the hot-reload file from disk.
   */
  deleteHotfile (): void {
    if (Fs.existsSync(this.hotfilePath)) {
      Fs.rmSync(this.hotfilePath)
    }
  }

  /**
   * Write the hot-reload file to disk.
   */
  writeFileSync (content: HotReloadFileContent): void {
    Fs.mkdirSync(Path.dirname(this.hotfilePath), { recursive: true })
    Fs.writeFileSync(this.hotfilePath, JSON.stringify(content))
  }
}
