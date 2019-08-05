'use strict'

const BaseCommand = require('../base-command')
const Worker = require('../../../queue/worker')

class QueueWork extends BaseCommand {
  constructor () {
    super()

    this.heartBeat = null
    this.worker = new Worker({})
  }

  static get signature () {
    return `
      queue:work
        { queues?: The queues to process }
    `
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Start the queue worker and process enqueued jobs'
  }

  async handle ({ queues }) {
    this.initializeHeartBeat()

    process.on('SIGINT', () => {
      this.stop()
    })

    // TODO handle jobs
  }

  initializeHeartBeat () {
    this.heartBeat = setInterval(() => {}, 1000)
  }

  async stop () {
    console.log('terminating queue worker')
    await this.worker.stop()
    process.exit(0)
  }
}

module.exports = QueueWork
