'use strict'

const QueueManager = require('../')

class Job {
  constructor (job) {
    this._job = job
    this._instance = null
    this._manager = QueueManager
  }

  get job () {
    return this._job
  }

  set job (job) {
    this._job = job
  }

  get instance () {
    return this._instance
  }

  set instance (instance) {
    this._instance = instance
  }

  get manager () {
    return this._manager
  }

  set manager (manager) {
    this._manager = manager
  }

  async fire () {
    const JobClass = this.manager.getJob(this.jobName())

    if (JobClass) {
      this.instance = new JobClass(this.payload())

      return this.instance.handle()
    }
  }
}

module.exports = Job
