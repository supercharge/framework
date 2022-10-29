'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('uvu')
const { expect } = require('expect')
const Supertest = require('supertest')
const { Server } = require('@supercharge/http')
const { Application, ErrorHandler } = require('../dist')

const viewMock = {
  render () {
    return '<h1>error-view</h1>'
  },
  exists (view) {
    return view === 'errors/401'
  }
}

function createApp () {
  const app = Application.createWithAppRoot(
    Path.resolve(__dirname, 'fixtures')
  ).withErrorHandler(ErrorHandler)

  app
    .bind('view', () => viewMock)

  app.config()
    .set('app.key', 1234)
    .set('http', {
      host: 'localhost',
      port: 1234,
      cookie: {}
    })

  return app
}

test('renders an error view', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(401, 'Authentication token missing')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(401)

  expect(response.text).toEqual('<h1>error-view</h1>')
})

test('falls back to Youch during development when missing an error view', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(418, 'Yo teapot')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(418)

  expect(response.text).toBeDefined()
  expect(response.text).toContain('Yo teapot')
})

test('falls back to JSON without stack trace in production', async () => {
  const app = createApp()
  app.env().set('NODE_ENV', 'production')

  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(425, 'Early bird!')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(425)

  expect(response.body).toMatchObject({
    message: 'Early bird!',
    statusCode: 425
  })
  expect(response.body.stack).toBeUndefined()
})

test('responds JSON with error stack', async () => {
  const app = createApp()
  app.env().set('NODE_ENV', 'development')

  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(401, 'Auth missing')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .set('accept', 'application/json')
    .expect(401)

  expect(response.body).toMatchObject({
    message: 'Auth missing',
    statusCode: 401
  })
  expect(response.body.stack).toBeDefined()
})

test('does not return the error stack in production', async () => {
  const app = createApp()
  app.env().set('NODE_ENV', 'production')

  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(418, 'Yo teapot')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .set('accept', 'application/json')
    .expect(418)

  expect(response.body).toMatchObject({
    message: 'Yo teapot',
    statusCode: 418
  })
  expect(response.body.stack).toBeUndefined()

  app.env().set('NODE_ENV', 'test')
})

test('calls report callbacks', async () => {
  let reportedError = null

  class CustomErrorHandler extends ErrorHandler {
    register () {
      this.reportable((_, error) => {
        reportedError = error
      })
    }
  }

  const app = createApp().withErrorHandler(CustomErrorHandler)
  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(418, 'Yo teapot')
  })

  await Supertest(
    server.callback()
  )
    .get('/')
    .expect(418)

  expect(reportedError.status).toEqual(418)
  expect(reportedError.message).toEqual('Yo teapot')
})

test('report callbacks can stop the reportable chain', async () => {
  let reportedError = null

  class StopsAfterFirstReportableErrorHandler extends ErrorHandler {
    register () {
      this
        .reportable(() => {
          return true
        })
        .reportable((_ctx, error) => {
          reportedError = error
        })
    }
  }

  const app = createApp().withErrorHandler(StopsAfterFirstReportableErrorHandler)
  const server = app.make(Server)

  const logSpy = Sinon.spy(app.logger(), 'error')

  server.use(async ({ response }) => {
    return response.throw(400, 'Bad Request')
  })

  await Supertest(
    server.callback()
  )
    .get('/')
    .expect(400)

  expect(reportedError).toBeNull()
  expect(logSpy.notCalled).toBe(true)

  logSpy.restore()
})

test('defaults to 500 error', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new Error('failed')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(500)

  expect(response.text).toBeDefined()
})

test('supports error.context method', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new ContextProvidingError('error with context')
  })

  const logSpy = Sinon.spy(app.logger(), 'error')

  await Supertest(
    server.callback()
  )
    .get('/')
    .expect(500)

  expect(logSpy.calledWith('error with context', { foo: 'bar', error: {} }))

  logSpy.restore()
})

test('supports error.report method', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new ReportingError('reporting error')
  })

  const logSpy = Sinon.spy(app.logger(), 'error')

  await Supertest(
    server.callback()
  )
    .get('/')
    .set('accept', 'application/json')
    .expect(418)

  expect(logSpy.calledWith('reporting error', { reported: true, error: {} }))
})

test('error handler should not report error', async () => {
  class ReportingErrorHandler extends ErrorHandler {
    dontReport () {
      return [
        ReportedError
      ]
    }
  }

  const app = createApp().withErrorHandler(ReportingErrorHandler)
  const server = app.make(Server)

  server.use(async () => {
    throw new ReportedError('reported error')
  })

  const logSpy = Sinon.spy(app.logger(), 'error')

  await Supertest(
    server.callback()
  )
    .get('/')
    .expect(422)

  expect(logSpy.notCalled).toBe(true)
})

test('ignore error', async () => {
  const app = createApp()
  const server = app.make(Server)

  app.make(ErrorHandler).ignore(ReportingError)

  server.use(async () => {
    throw new ReportingError('reporting error')
  })

  const logSpy = Sinon.spy(app.logger(), 'error')

  await Supertest(
    server.callback()
  )
    .get('/')
    .expect(418)

  expect(logSpy.notCalled).toBe(true)
})

test('error.report can stop the reporting chain', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new ReportedError('reported error')
  })

  const logSpy = Sinon.spy(app.logger(), 'error')

  await Supertest(
    server.callback()
  )
    .get('/')
    .set('accept', 'application/json')
    .expect(422)

  expect(logSpy.notCalled).toBe(true)
})

test('supports error.handle method', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new ErrorHandlingError('error handles itself')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .set('accept', 'application/json')
    .expect(422)

  expect(response.body).toMatchObject({
    message: 'error handles itself',
    foo: 'bar'
  })
})

class ContextProvidingError extends Error {
  context () {
    return {
      foo: 'bar'
    }
  }
}

class ReportingError extends Error {
  constructor (message) {
    super(message)
    this.status = 418
    this.reported = undefined
  }

  context () {
    return {
      reported: this.reported
    }
  }

  report () {
    this.reported = true
  }
}

class ReportedError extends ReportingError {
  constructor (message) {
    super(message)
    this.status = 422
  }

  report () {
    super.report()
    return true
  }
}

class ErrorHandlingError extends Error {
  handle (ctx, error) {
    return ctx.response.payload({
      message: error.message,
      foo: 'bar',
      error
    }).status(422)
  }
}

// class UnhandledError extends Error {
//   handle () {
//     return false
//   }
// }

test.run()
