
import { ErrorHandler as Handler } from '@supercharge/core'

export default class ErrorHandler extends Handler {
  handle (error, ctx) {
    // console.error('Received error in testing error handler', { error })

    return super.handle(error, ctx)
  }
}
