
const { test } = require('uvu')
const { Server } = require('../dist')
const Supertest = require('supertest')
const { setupApp } = require('./helpers')

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('returns the raw context', async () => {
  const server = app.make(Server).use(({ response, raw }) => {
    return response.payload({
      hasRaw: !!raw
    })
  })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { hasRaw: true })
})

test.run()
