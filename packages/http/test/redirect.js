
const { test } = require('uvu')
const { expect } = require('expect')
const { Server } = require('../dist')
const Supertest = require('supertest')
const { setupApp } = require('./helpers')

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('redirect is chainable', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().to('/path').withPayload()
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(307)

  expect(response.headers.location).toEqual('/path')
})

test('redirect to URL path', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().to('/path?with-query=param').withPayload()
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(307)

  expect(response.headers.location).toEqual('/path?with-query=param')
})

test('redirect.back() to referer', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().back()
    })

  const backToPath = await Supertest(server.callback())
    .get('/some-path?with-query=param')
    .set('referer', '/some-path?with-query=param')
    .expect(302)

  expect(backToPath.headers.location).toEqual('/some-path?with-query=param')
})

test('redirect.back() to root (/) when referer is not set', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().back()
    })

  const backToRoot = await Supertest(server.callback())
    .get('/some-path?with-query=param')
    .expect(302)

  expect(backToRoot.headers.location).toEqual('/')
})

test('redirect.back() with fallback', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().back({ fallback: '/login' })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/login')
})

test('redirect.permanent()', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().permanent().to('/permanent-path')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(301)

  expect(response.headers.location).toEqual('/permanent-path')
})

test.run()
