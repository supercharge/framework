
import { ErrorHandler as Handler } from '@supercharge/core'

export default class ErrorHandler extends Handler {
  handle (ctx, error) {
    // console.error('Received error in testing error handler', { error })

    return super.handle(ctx, error)
  }
}
