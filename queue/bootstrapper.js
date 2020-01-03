'use strict'

const QueueManager = require('./')
const Fs = require('../filesystem')
const Helper = require('../helper')
const Connectors = require('./connections')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')

class QueueBootstrapper {
  constructor () {
    this._jobFiles = null
    this.jobsPath = 'app/jobs'
    this.manager = QueueManager
  }

  /**
   * Booting the queue bootstrapper will register all available queues
   * and load and cache all jobs. Loading the queue jobs into memory
   * helps to dispatch individual job instances.
   */
  async boot () {
    await this.registerConnectors()
    await this.loadQueueJobs()
  }

  /**
   * Register all available queues to the queue manager.
   */
  registerConnectors () {
    Object
      .entries(Connectors)
      .forEach(([name, connector]) => {
        this.manager.addConnector(name, connector)
      })
  }

  /**
   * Load the application’s queue jobs if existent.
   */
  async loadQueueJobs () {
    if (await this.hasJobs()) {
      return this.loadJobs()
    }
  }

  /**
   * Determines whether queue jobs exist in
   * expected location.
   *
   * @returns {Boolean}
   */

  async hasJobs () {
    return await this.jobsFolderExists()
      ? this.hasJobFiles()
      : false
  }

  /**
   * Determines whether the default location for
   * queue jobs exists on the file system.
   *
   * @returns {Boolean}
   */
  async jobsFolderExists () {
    return Fs.exists(this.jobsFolder())
  }

  /**
   * Returns the absolute path to the jobs folder.
   *
   * @returns {String}
   */
  jobsFolder () {
    return Helper.fromAppRoot(this.jobsPath)
  }

  /**
   * Determines whether job files exist in the application.
   *
   * @returns {Boolean}
   */
  async hasJobFiles () {
    return Collect(
      await this.jobFiles()
    ).isNotEmpty()
  }

  /**
   * Loads all job files recursively from the file system.
   *
   * @returns {Array}
   */
  async jobFiles () {
    if (!this._jobFiles) {
      this._jobFiles = await ReadRecursive(this.jobsFolder())
    }

    return this._jobFiles
  }

  /**
   * Registers all queue jobs to the queue manager.
   */
  async loadJobs () {
    await Collect(
      await this.jobFiles()
    ).forEach(jobfile => {
      return this.manager.addJob(require(jobfile))
    })
  }
}

module.exports = QueueBootstrapper
