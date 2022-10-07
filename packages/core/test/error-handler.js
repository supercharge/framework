'use strict'

const Path = require('path')
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

test('falls back to Youch when missing an error view', async () => {
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
})

test('responds JSON when request is asking for it', async () => {
  const app = createApp()
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

  const app = createApp()
    .bind('error.handler', () => new CustomErrorHandler(app))

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

test.run()
