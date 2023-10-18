
import Sinon from 'sinon'
import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { fileURLToPath } from 'node:url'
import { Server } from '@supercharge/http'
import { ViewServiceProvider } from '@supercharge/view'
import { Application, ErrorHandler } from '../dist/index.js'

const viewMock = {
  boot () { },
  render () {
    return '<h1>error-view</h1>'
  },
  exists (view) {
    return view === 'errors/401'
  }
}

const appRootPath = fileURLToPath(import.meta.resolve('./fixtures'))

function createApp () {
  const app = Application
    .createWithAppRoot(appRootPath)
    .withErrorHandler(ErrorHandler)

  app
    .bind('view', () => viewMock)

  app.config()
    .set('app.key', 1234)
    .set('http', {
      host: 'localhost',
      port: 1234,
      cookie: {}
    })
    .set('view', {
      driver: 'handlebars',
      handlebars: {
        views: app.resourcePath('views'),
        partials: app.resourcePath('views/partials'),
        helpers: app.resourcePath('views/helpers')
        // layouts: app.resourcePath('views/layouts')
        // defaultLayout: 'app'
      }
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

  expect(response.text).toEqual('<h1>Authentication token missing</h1>')
})

test('renders an error view using @supercharge/view', async () => {
  const app = createApp()

  app.register(new ViewServiceProvider(app))
  await app.boot()

  const server = app.make(Server)

  server.use(async ({ response }) => {
    return response.throw(401, 'Authentication token missing')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(401)

  expect(response.text).toEqual('<h1>error-view</h1>\n')
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

test('error.report returning false proceeds the reporting chain', async () => {
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

  expect(logSpy.calledOnce).toBe(true)
})

test('supports error.render method', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new RenderError('error handles itself')
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

test('error.render returning false proceeds the rendering chain', async () => {
  const app = createApp()
  const server = app.make(Server)

  server.use(async () => {
    throw new RenderedError('error handles itself')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .set('accept', 'application/json')
    .expect(405)

  expect(response.body).toMatchObject({
    message: 'error handles itself'
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
    return false
  }
}

class RenderError extends Error {
  render (ctx, error) {
    return ctx.response.payload({
      message: error.message,
      foo: 'bar',
      error
    }).status(422)
  }
}

class RenderedError extends Error {
  constructor (message) {
    super(message)
    this.status = 405
  }

  render () {
    return false
  }
}

test.run()
