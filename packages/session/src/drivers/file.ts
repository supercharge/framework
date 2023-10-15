
import Path from 'path'
import Fs from '@supercharge/fs'
import { SessionDriver } from '@supercharge/contracts'
import { InteractsWithTime } from '@supercharge/support'

interface SessionEntry { expires: number, data: any }

export class FileSessionDriver extends InteractsWithTime implements SessionDriver {
  /**
   * Stores the file system path where sessions should be stored.
   */
  private readonly sessionFilesLocation: string

  /**
   * Stores the session lifetime in seconds.
   */
  private readonly lifetimeInSeconds: number

  /**
   * Create a new file driver instance.
   */
  constructor (lifetimeInSeconds: number, location: string) {
    super()

    this.lifetimeInSeconds = lifetimeInSeconds
    this.sessionFilesLocation = location
  }

  /**
   * Returns the file path to the session file for the given `sessionId`.
   */
  protected resolveSessionFilePath (sessionId: string): string {
    return Path.join(this.sessionFilesLocation, `${sessionId}.json`)
  }

  /**
   * Read the session data.
   */
  async read (sessionId: string): Promise<Record<string, any>> {
    const file = this.resolveSessionFilePath(sessionId)

    await Fs.ensureFile(file)
    const content = await Fs.content(file)

    if (content.trim().length === 0) {
      return {}
    }

    try {
      const session: SessionEntry = JSON.parse(content)

      if (this.now().getTime() <= session.expires) {
        return session.data
      }
    } catch (error) {
      // parsing the JSON content failed
    }

    return {}
  }

  /**
   * Store the session data.
   */
  async write (sessionId: string, data: Record<string, any>): Promise<this> {
    const file = this.resolveSessionFilePath(sessionId)
    const expires = this.availableAt(this.lifetimeInSeconds)

    await Fs.outputJson(file, { expires, data })

    return this
  }

  /**
   * Delete the session data for the given `sessionId`.
   */
  async destroy (sessionId: string): Promise<this> {
    await Fs.removeFile(
      this.resolveSessionFilePath(sessionId)
    )

    return this
  }
}
