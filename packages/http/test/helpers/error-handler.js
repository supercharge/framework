
export default class ErrorHandler {
  handle (error, ctx) {
    // console.log('Received error in testing error handler', { error })

    ctx.response.status(error.status || error.statusCode || 500)
    ctx.response.payload(error.message)
  }
}
