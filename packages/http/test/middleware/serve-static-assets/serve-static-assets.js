
import { test } from 'uvu'
import Path from 'node:path'
import Supertest from 'supertest'
import { fileURLToPath } from 'node:url'
import { setupApp } from '../../helpers/index.js'
import defaultStaticAssetsConfig from './fixtures/static-assets.js'
import { ServeStaticAssetsMiddleware, Server } from '../../../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = Path.resolve(__dirname, './fixtures')

const app = setupApp({
  static: defaultStaticAssetsConfig,
  appRoot: fixturesPath
})

async function createHttpServer () {
  const server = app.forgetInstance(Server).make(Server)
    .use(ServeStaticAssetsMiddleware)
    .use(async (ctx, next) => {
      if (ctx.request.path() === '/unavailable.txt') {
        return ctx.response.payload('ok')
      }

      await next()
    })

  server.router().get('/:matchAll', ({ response }) => {
    return response.getPayload() || 'route handler response'
  })

  await server.bootstrap()

  return server.callback()
}

test('returns index.html', async () => {
  await Supertest(await createHttpServer())
    .get('/index.html')
    .expect(200, '<h1>Hello Supercharge</h1>\n')
})

test('returns style.css', async () => {
  await Supertest(await createHttpServer())
    .get('/style.css')
    .expect(200, 'p { color: #ff9933; }\n')
})

test('pass through when unable to lookup asset', async () => {
  await Supertest(await createHttpServer())
    .get('/unavailable.txt')
    .expect(200, 'ok')
})

test.run()
