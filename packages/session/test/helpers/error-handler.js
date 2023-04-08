'use strict'

const { ErrorHandler: Handler } = require('@supercharge/core')

module.exports = class ErrorHandler extends Handler {
  handle (ctx, error) {
    // console.error('Received error in testing error handler', { error })

    return super.handle(ctx, error)
  }
}
