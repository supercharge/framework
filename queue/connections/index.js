'use strict'

module.exports = {
  sqs: require('./sqs-queue'),
  sync: require('./sync-queue'),
  faktory: require('./faktory-queue')
}
