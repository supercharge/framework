
import { test } from 'uvu'
import Supertest from 'supertest'
import { Server } from '../dist/index.js'
import { setupApp } from './helpers/index.js'

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
