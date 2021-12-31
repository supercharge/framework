'use strict'

const { test } = require('uvu')
const expect = require('expect')
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

const app = new Application(__dirname)
app.config().set('app.key', 1234)
app
  .bind('view', () => viewMock)
  .bind('error.handler', () => new ErrorHandler(app))

//

test('renders an error view', async () => {
  const server = new Server(app)

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

test('falls back to JSON when missing an error view', async () => {
  const server = new Server(app)

  server.use(async ({ response }) => {
    return response.throw(418, 'Yo teapot')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(418)

  expect(response.body).toMatchObject({
    message: 'Yo teapot',
    statusCode: 418
  })
  expect(response.body.stack).not.toBeUndefined()
})

test('does not return the error stack in production', async () => {
  const app = new Application(__dirname)
  app.config().set('app.key', 1234)
  app.env().set('NODE_ENV', 'production')
  app
    .bind('view', () => viewMock)
    .bind('error.handler', () => new ErrorHandler(app))

  const server = new Server(app)

  server.use(async ({ response }) => {
    return response.throw(418, 'Yo teapot')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(418)

  expect(response.body).toMatchObject({
    message: 'Yo teapot',
    statusCode: 418
  })
  expect(response.body.stack).toBeUndefined()
})

test('responds JSON when request is asking for it', async () => {
  const server = new Server(app)

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

  const app = new Application(__dirname)
  app.config().set('app.key', 1234)
  app
    .bind('view', () => viewMock)
    .bind('error.handler', () => new CustomErrorHandler(app))

  const server = new Server(app)

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

test('defaults to 500 error', async () => {
  const server = new Server(app)

  server.use(async () => {
    throw new Error('failed')
  })

  const response = await Supertest(
    server.callback()
  )
    .get('/')
    .expect(500)

  expect(response.body).toMatchObject({
    message: 'failed',
    statusCode: 500
  })
})

test.run()
