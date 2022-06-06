'use strict'

const { test } = require('uvu')
// const { expect } = require('expect')
const Supertest = require('supertest')
const { setupApp } = require('./helpers')
const { SessionManager } = require('../dist')
const { Server } = require('@supercharge/http')

test('Starts a server without routes', async () => {
  const app = await setupApp()
  const server = new Server(app)
  const sessionManager = new SessionManager(app)

  server.use(({ request, response }) => {
    const session = sessionManager.createFrom(request)
    // TODO

    console.log({ session })

    return response.payload('ok')
  })

  await Supertest(server.callback())
    .get('/')
    .expect(200)
})

// test.skip('adds a middleware using a function handler', async () => {
//   let called = false

//   const server = new Server(app).use(async (ctx) => {
//     called = true

//     return ctx.response.payload('ok')
//   })

//   await Supertest(server.callback())
//     .get('/')
//     .expect(200, 'ok')

//   expect(called).toEqual(true)
// })

test.run()
