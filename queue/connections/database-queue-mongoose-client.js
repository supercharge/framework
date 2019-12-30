'use strict'

const Database = require('../../database')
const { Mongoose } = Database
const MongooseJob = require('../jobs/mongoose-job')

class DatabaseQueueMongooseClient {
  static async insert (job) {
    return this.create(job)
  }

  static async push ({ job, payload, queue, attempts = 0 }) {
    const doc = await this.insert({
      queue,
      payload,
      attempts,
      jobClassName: job.name
    })

    return doc.id
  }

  static async pop (queue) {
    const query = { startTime: null, queue }
    const update = { startTime: new Date() }
    const options = {
      new: true, // tells MongoDB to return the updated document
      sort: { createdOn: 1 } // sort by oldest creation date (ensures FIFO)
    }

    const job = await this.findOneAndUpdate(query, update, options)

    return job
      ? new MongooseJob(job, this, queue)
      : null
  }

  static async size (queue) {
    return this.countDocuments({ startTime: null, queue })
  }

  static async delete (id) {
    return this.findByIdAndDelete(id)
  }
}

const schema = new Mongoose.Schema({
  startTime: Date,
  endTime: Date,
  queue: String,
  payload: Object,
  jobClassName: String,
  attempts: { type: Number, default: 0 },
  createdOn: { type: Date, default: Date.now }
})

schema.loadClass(DatabaseQueueMongooseClient)

module.exports = Mongoose.model('Queue-Jobs', schema)
