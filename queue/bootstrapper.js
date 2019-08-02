'use strict'

const QueueManager = require('./')
const Fs = require('../filesystem')
const Helper = require('../helper')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')

class QueueBootstrapper {
  constructor () {
    this._jobFiles = null
    this.jobsPath = 'app/jobs'
    this.manager = QueueManager
  }

  async boot () {
    await this.manager.connect()
    await this.loadQueueJobs()
    console.log(this.manager.queues)
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
