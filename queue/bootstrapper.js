'use strict'

const QueueManager = require('./')
const Fs = require('../filesystem')
const Helper = require('../helper')
const Connectors = require('./connectors')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')

const Job = require('./dispatchable')

class QueueBootstrapper {
  constructor () {
    this._jobFiles = null
    this.jobsPath = 'app/jobs'
    this.manager = QueueManager
  }

  async boot () {
    await this.registerConnectors()
    await this.loadQueueJobs()

    Job
      .onQueue('log-names')
      .dispatch({ name: 'Marcus' })
  }

  registerConnectors () {
    Object
      .entries(Connectors)
      .forEach(([name, connector]) => {
        this.manager.addConnector(name, connector)
      })
  }

  async loadQueueJobs () {
    if (await this.hasJobs()) {
      return this.loadJobs()
    }
  }

  /**
   * Text
   *
   * @returns {Boolean}
   */

  async hasJobs () {
    return await this.jobsFolderExists()
      ? this.hasJobFiles()
      : false
  }

  /**
   * Text
   *
   * @returns {Boolean}
   */
  async jobsFolderExists () {
    return Fs.exists(this.jobsFolder())
  }

  /**
   * Text
   *
   * @returns {String}
   */
  jobsFolder () {
    return Helper.fromAppRoot(this.jobsPath)
  }

  /**
   * Text
   *
   * @returns {Boolean}
   */
  async hasJobFiles () {
    return Collect(
      await this.jobFiles()
    ).isNotEmpty()
  }

  /**
   * Text
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
   * Text
   *
   * @returns {Array}
   */
  async loadJobs () {
    await Collect(
      await this.jobFiles()
    ).forEach(jobfile => {
      return this.manager._createQueueForJob(require(jobfile))
    })
  }
}

module.exports = QueueBootstrapper
