
import { test } from 'uvu'
import Supertest from 'supertest'
import { setupApp } from '../../helpers/index.js'
import defaultCorsConfig from './fixtures/cors-config.js'
import { HandleCorsMiddleware, Server } from '../../../dist/index.js'

const app = setupApp({ cors: defaultCorsConfig })

async function createHttpServer () {
  const server = app.make(Server)
    .use(HandleCorsMiddleware)
    .use(ctx => {
      return ctx.response.payload('ok')
    })

  await server.bootstrap()

  return server.callback()
}

test('expects 204 on preflight request', async () => {
  await Supertest(await createHttpServer())
    .options('/')
    .set('Origin', 'https://superchargejs.com')
    .set('Access-Control-Request-Method', 'PUT')
    .expect(204)
    .expect('Access-Control-Allow-Origin', 'https://superchargejs.com')
    .expect('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, PATCH')
})

test('always set `vary` response header to origin', async () => {
  await Supertest(await createHttpServer())
    .get('/')
    .expect(200, 'ok')
    .expect('Vary', 'Origin')
})

test.run()
