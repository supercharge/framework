'use strict'

module.exports = class ErrorHandler {
  handle (ctx, error) {
    // console.log({ ctx, error })

    if (error.status || error.statusCode) {
      return ctx.response.status(error.status || error.statusCode)
    }
  }
}
