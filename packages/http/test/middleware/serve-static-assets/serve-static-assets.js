'use strict'

const Path = require('path')
const { test } = require('uvu')
const deepmerge = require('deepmerge')
const Supertest = require('supertest')
const { isConstructor } = require('@supercharge/classes')
const defaultStaticAssetsConfig = require('./fixtures/static-assets')
const { ServeStaticAssetsMiddleware, Server, Router, Request, Response } = require('../../../dist')

function createAppMock (staticAssetsConfig = {}) {
  return {
    publicPath () {
      return Path.resolve(__dirname, 'fixtures', 'public')
    },
    key () {
      return 1234
    },
    make (key) {
      if (isConstructor(key)) {
        // eslint-disable-next-line new-cap
        return new key(this)
      }

      if (key === 'route') {
        return new Router()
      }

      if (key === 'request') {
        return Request
      }

      if (key === 'response') {
        return Response
      }
    },
    singleton () {},
    config () {
      return {
        get () {
          return deepmerge.all([{}, defaultStaticAssetsConfig, staticAssetsConfig])
        }
      }
    }
  }
}

async function createHttpServer (staticAssetsConfig) {
  const appMock = createAppMock(staticAssetsConfig)

  const server = new Server(appMock)
    .use(ServeStaticAssetsMiddleware)
    .use(async (ctx, next) => {
      if (ctx.request.path() === '/unavailable.txt') {
        return ctx.response.payload('ok')
      }

      await next()
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
