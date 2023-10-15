
const { test } = require('uvu')
const { Server } = require('../dist')
const Supertest = require('supertest')
const { setupApp } = require('./helpers')

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('pending .get() route', async () => {
  const server = app.make(Server)
  const router = server.router()

  router.prefix('api').get('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .get('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .post() route', async () => {
  const server = app.make(Server)
  const router = server.router()

  router
    .prefix('api')
    .post('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .post('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .put() route', async () => {
  const server = app.make(Server)
  const router = server.router()

  router
    .prefix('api')
    .put('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .put('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .delete() route', async () => {
  const server = app.make(Server)
  const router = server.router()

  router
    .prefix('api')
    .delete('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .delete('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .patch() route', async () => {
  const server = app.make(Server)
  const router = server.router()

  router
    .prefix('api')
    .patch('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .patch('/api/name')
    .expect(200, 'Supercharge')
})

test('pending .options() route', async () => {
  const server = app.make(Server)
  const router = server.router()

  router
    .prefix('api')
    .options('/name', () => 'Supercharge')

  await server.bootstrap()

  await Supertest(server.callback())
    .options('/api/name')
    .expect(200, 'Supercharge')
})

test.run()
