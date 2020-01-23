'use strict'

const Database = require('../../database')
const { Mongoose } = Database
const MongooseJob = require('../jobs/mongoose-job')

class DatabaseQueueMongooseClient {
  /**
   * Push a new job into the MongoDB queue.
   *
   * @param {options} options
   *
   * @returns {String} job ID
   */
  static async push ({ job, payload, queue, attempts = 0, notBefore = new Date() }) {
    const doc = await this.create({
      queue,
      payload,
      attempts,
      notBefore,
      jobClassName: job.name
    })

    return doc.id
  }

  /**
   * Fetches the next job from the given `queue`.
   *
   * @param {String|Array} queue
   *
   * @returns {Job}
   */
  static async pop (queue) {
    const query = {
      startTime: null,
      notBefore: { $lte: new Date() },
      queue: { $in: [].concat(queue) }
    }

    const update = {
      startTime: new Date()
    }

    const options = {
      new: true, // tells MongoDB to return the updated document
      sort: { createdOn: 1 } // sort by oldest creation date (ensures FIFO)
    }

    const job = await this.findOneAndUpdate(query, update, options)

    return job
      ? new MongooseJob(job, this, queue)
      : null
  }

  /**
   * Returns number of jobs on the given `queue`.
   *
   * @param  {String|Array} queue
   *
   * @returns {Number}
   */
  static async size (queue) {
    return this.countDocuments({
      startTime: null,
      queue: { $in: [].concat(queue) }
    })
  }

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String|Array} queue
   */
  static async clear (queue) {
    return this.deleteMany({
      queue: { $in: [].concat(queue) }
    })
  }

  /**
   * Deletes the job with the given `id` from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Number}
   */
  static async delete (id) {
    return this.findByIdAndDelete(id)
  }
}

/**
 * The factory function to create a Mongoose model for the given
 * `config`. The config defines the model’s collection name.
 *
 * @param {Object} config
 *
 * @returns {Model}
 */
const factory = (config) => {
  const schema = new Mongoose.Schema({
    startTime: Date,
    endTime: Date,
    notBefore: Date,
    queue: String,
    payload: Object,
    jobClassName: String,
    attempts: { type: Number, default: 0 },
    createdOn: { type: Date, default: Date.now }
  }, {
    collection: config.table
  })

  schema.loadClass(DatabaseQueueMongooseClient)

  return Mongoose.model('Queue-Jobs', schema)
}

module.exports = factory
