
import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { Server } from '../dist/index.js'
import { setupApp } from './helpers/index.js'

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('request.path() returns the URL path', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.path()
      )
    })

  await Supertest(server.callback())
    .get('/supercharge/123/cool')
    .expect(200, '/supercharge/123/cool')
})

test('request.query() returns the querystring', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(request.query())
    })

  await Supertest(server.callback())
    .get('/?name=Supercharge&marcus=isCool')
    .expect(200, { name: 'Supercharge', marcus: 'isCool' })
})

test('request.query().toQuerystring() returns the querystring', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      if (request.query().has('addFoo')) {
        request.query().set('foo', 'bar')
      }
      return response.payload(
        request.query().toQuerystring()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, '')

  await Supertest(server.callback())
    .get('/?name=Supercharge&marcus=isCool')
    .expect(200, 'name=Supercharge&marcus=isCool')

  await Supertest(server.callback())
    .get('/?addFoo=1&name=Supercharge')
    .expect(200, 'addFoo=1&name=Supercharge&foo=bar')
})

test('request.query().toQuerystringDecoded()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      if (request.query().has('addFoo')) {
        request.query().set('foo', 'bar')
      }
      return response.payload(
        request.query().toQuerystringDecoded()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, '')

  await Supertest(server.callback())
    .get('/?name=Supercharge&marcus=isCool')
    .expect(200, 'name=Supercharge&marcus=isCool')

  await Supertest(server.callback())
    .get('/?name=Supercharge&marcus[]=isCool&marcus[]=isQuery')
    .expect(200, 'name=Supercharge&marcus[]=isCool,isQuery')

  await Supertest(server.callback())
    .get('/?addFoo=1&name=Supercharge')
    .expect(200, 'addFoo=1&name=Supercharge&foo=bar')
})

test('request.all() returns merged query params, payload, and files', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request
        .setPayload({ supercharge: 'is cool' })
        .setFiles({ upload: { originalFilename: 'UploadedFile' } })

      return response.payload({
        all: request.all(),
        query: request.query(),
        files: request.files(),
        payload: request.payload()
      })
    })

  await Supertest(server.callback())
    .get('/?name=Supercharge')
    .expect(200, {
      query: { name: 'Supercharge' },
      payload: { supercharge: 'is cool' },
      files: { upload: { name: 'UploadedFile' } },
      all: { name: 'Supercharge', supercharge: 'is cool', upload: { name: 'UploadedFile' } }
    })
})

test('request.input() returns empty payload when not providing a key', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        input: request.input()
      })
    })

  const response = await Supertest(server.callback())
    .get('/?name=Supercharge')
    .expect(200)

  expect(response.body).toMatchObject({})
})

test('request.input() returns a single key from query params', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        input: request.input('name', 'Marcus')
      })
    })

  await Supertest(server.callback())
    .get('/?name=Supercharge')
    .expect(200, { input: 'Supercharge' })
})

test('request.input() returns a single key from payload', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.setPayload({ supercharge: 'is cool' })

      return response.payload({
        input: request.input('name', 'Marcus')
      })
    })

  await Supertest(server.callback())
    .get('/?name=Supercharge')
    .expect(200, { input: 'Supercharge' })
})

test('request.input() returns a single key from files', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.setFiles({ upload: { originalFilename: 'UploadedFile' } })

      return response.payload({
        input: request.input('upload')
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({
    input: { name: 'UploadedFile' }
  })
})

test('request.input() returns a default', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        input: request.input('missing-input-key', 'Marcus')
      })
    })

  await Supertest(server.callback())
    .get('/?name=Supercharge')
    .expect(200, { input: 'Marcus' })
})

test('request.params() returns the path params', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.params().set('name', 'Supercharge')

      return response.payload({
        params: request.params()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { params: { name: 'Supercharge' } })
})

test('request.param() returns the param value', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.params().set('name', 'Supercharge')

      return response.payload({
        param: request.param('name')
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { param: 'Supercharge' })
})

test('request.param() returns the param default value if it doesn’t exist', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        param: request.param('name', 'Marcus')
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { param: 'Marcus' })
})

test('request.headers()', async () => {
  const server = app
    .make(Server)
    .use(async ({ request, response }, next) => {
      request.headers().set('x-name', 'Supercharge')
      await next()
    })
    .use(async ({ request, response }, next) => {
      return response.payload({
        headers: request.headers()
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('x-testing', 'foo')
    .expect(200)

  expect(response.body).toMatchObject({
    headers: {
      'x-testing': 'foo',
      'x-name': 'Supercharge'
    }
  })
})

test('request.header()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        headers: request.headers()
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('X-Testing', 'foo')
    .expect(200)

  expect(response.body).toMatchObject({
    headers: {
      'x-testing': 'foo'
    }
  })
})

test('request.headers().all()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.headers()
        .set('foo', 'bar')
        .set('sessionId', 1)
        .set('name', 'Supercharge')
        .set('supercharge', 'is cool')

      return response.payload({
        headers: request.headers().all('name', 'foo')
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({
    headers: {
      foo: 'bar',
      name: 'Supercharge'
    }
  })
})

test('request.headers().get(key, defaultValue)', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.headers().get('name', 'defaultValue')
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'defaultValue')
})

test('request.headers().has()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.headers()
        .set('sessionId', 1)
        .set('name', 'Supercharge')

      return response.payload(
        request.headers().has('name')
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'true')
})

test('request.hasHeader()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.hasHeader('sessionId')
      )
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, 'false')
})

test('response.headers().remove()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      request.headers()
        .set('sessionId', 1)
        .set('name', 'Supercharge')

      return response.payload(
        request.headers().remove('name')
      )
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({ sessionid: 1 })
  expect(response.body).not.toMatchObject({ name: 'Supercharge' })
})

test('request.cookie() returns an unsigned (plain) cookie', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        cookies: { data: request.cookie('data', cookie => cookie.unsigned()) }
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('Cookie', 'data=value')
    .expect(200)

  expect(response.headers['set-cookie']).toBeUndefined()
  expect(response.body).toMatchObject({
    cookies: { data: 'value' }
  })
})

test('request.cookie() returns a signed cookie', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.payload('ok').cookie('name', 'Supercharge')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('Cookie', 'key=value')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name.sig=ooJzAUpkODKlv98H8OWyGG6vnPo; path=/; httponly'
  ])
})

test('request.cookies().has(cookieName) determines whether a cookie exists', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        fooExists: request.hasCookie('foo'),
        barExists: request.hasCookie('bar')
      })
    })

  await Supertest(server.callback())
    .get('/')
    .set('Cookie', 'foo=bar')
    .expect(200, { fooExists: true, barExists: false })
})

test('request.cookies().has(cookieName) works without request cookies', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        exists: request.hasCookie('foo')
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { exists: false })
})

test('creating a cookie uses default options', async () => {
  const cookieTTL = 123
  const cookieOptions = {
    maxAge: cookieTTL,
    path: '/path',
    sameSite: 'lax',
    signed: false
  }

  const server = setupApp({ http: { cookie: cookieOptions } })
    .make(Server)
    .use(({ response }) => {
      return response.payload('ok').cookie('foo', 'bar')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('Cookie', 'foo=bar')
    .expect(200, 'ok')

  expect(response.headers['set-cookie']).toEqual([
    `foo=bar; path=/path; expires=${new Date(Date.now() + cookieTTL).toUTCString()}; samesite=lax; httponly`
  ])
})

test('request.isJson()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.isJson()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .set('content-type', 'text/html')
    .expect(200, 'false')

  await Supertest(server.callback())
    .get('/')
    .set('content-type', 'application/json')
    .expect(200, 'true')

  await Supertest(server.callback())
    .get('/')
    .set('content-type', 'application/vnd.supercharge+json')
    .expect(200, 'true')
})

test('request.wantsJson()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.wantsJson()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .set('accept', 'text/html')
    .expect(200, 'false')

  await Supertest(server.callback())
    .get('/')
    .set('accept', 'application/json')
    .expect(200, 'true')

  await Supertest(server.callback())
    .get('/')
    .set('accept', 'application/vnd.supercharge+json')
    .expect(200, 'true')
})

test('request.wantsHtml()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.wantsHtml()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .set('accept', 'text/html')
    .expect(200, 'true')

  await Supertest(server.callback())
    .get('/')
    .set('accept', 'application/json')
    .expect(200, 'false')

  await Supertest(server.callback())
    .get('/')
    .set('accept', 'application/vnd.supercharge+json')
    .expect(200, 'false')
})

test('request.isMethodCacheable()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response
        .header('is-cacheable', request.isMethodCacheable())
        .payload({ isCacheable: request.isMethodCacheable() })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { isCacheable: true })

  const response = await Supertest(server.callback())
    .head('/')
    .expect(200)
  expect(response.headers['is-cacheable']).toBe('true')

  await Supertest(server.callback())
    .post('/')
    .expect(200, { isCacheable: false })

  await Supertest(server.callback())
    .put('/')
    .expect(200, { isCacheable: false })

  await Supertest(server.callback())
    .delete('/')
    .expect(200, { isCacheable: false })

  await Supertest(server.callback())
    .options('/')
    .expect(200, { isCacheable: false })
})

test('request.isMethodNotCacheable()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response
        .header('not-cacheable', request.isMethodNotCacheable())
        .payload({ notCacheable: request.isMethodNotCacheable() })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { notCacheable: false })

  const response = await Supertest(server.callback())
    .head('/')
    .expect(200)
  expect(response.headers['not-cacheable']).toBe('false')

  await Supertest(server.callback())
    .post('/')
    .expect(200, { notCacheable: true })

  await Supertest(server.callback())
    .put('/')
    .expect(200, { notCacheable: true })

  await Supertest(server.callback())
    .delete('/')
    .expect(200, { notCacheable: true })

  await Supertest(server.callback())
    .options('/')
    .expect(200, { notCacheable: true })
})

test('request.contentLength()', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload(
        request.contentLength()
      )
    })

  await Supertest(server.callback())
    .get('/')
    .set('content-length', 123)
    .expect(200, '123')

  await Supertest(server.callback())
    .get('/')
    .expect(200, '0')
})

test('isMethod', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        isGet: request.isMethod('GET'),
        isPost: request.isMethod('POST'),
        isGetFromArray: request.isMethod(['GET', 'PUT', 'PATCH'])
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, {
      isGet: true,
      isPost: false,
      isGetFromArray: true
    })
})

test('userAgent', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        userAgent: request.userAgent()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .set('user-agent', 'macOS-Supercharge-UA')
    .expect(200, {
      userAgent: 'macOS-Supercharge-UA'
    })

  await Supertest(server.callback())
    .get('/')
    .set('User-Agent', 'macOS-Supercharge-UA')
    .expect(200, {
      userAgent: 'macOS-Supercharge-UA'
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { })
})

test('querystring', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        querystring: request.queryString()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { querystring: '' })

  await Supertest(server.callback())
    .get('/?name=Supercharge')
    .expect(200, { querystring: 'name=Supercharge' })

  await Supertest(server.callback())
    .get('/?name=Supercharge&foo=bar')
    .expect(200, { querystring: 'name=Supercharge&foo=bar' })
})

test('fullUrl', async () => {
  const app = setupApp()
  app.config().set('http.port', 3013)

  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        fullUrl: request.fullUrl()
      })
    })

  await Supertest(server.callback())
    .get('/foo?bar=baz&name=Supercharge')
    .set({ host: 'localhost:3013' })
    .expect(200, { fullUrl: 'http://localhost:3013/foo?bar=baz&name=Supercharge' })
})

test('protocol', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        protocol: request.protocol()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .expect(200, { protocol: 'http' })
})

test('protocol - when x-forwarded-proto is empty', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        protocol: request.protocol()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .set({ 'X-Forwarded-Proto': '' })
    .expect(200, { protocol: 'http' })
})

test('protocol - when x-forwarded-proto is set and trusted proxy', async () => {
  const app = setupApp()
  app.config().set('app.runsBehindProxy', true)

  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        protocol: request.protocol()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .set({ 'X-Forwarded-Proto': 'https' })
    .expect(200, { protocol: 'https' })

  await Supertest(server.callback())
    .get('/')
    .set({ 'X-Forwarded-Proto': 'https, http' })
    .expect(200, { protocol: 'https' })
})

test('protocol - when x-forwarded-proto is set and not trusting proxy', async () => {
  const app = setupApp({})

  const server = app
    .make(Server)
    .use(({ request, response }) => {
      return response.payload({
        protocol: request.protocol()
      })
    })

  await Supertest(server.callback())
    .get('/')
    .set({ 'X-Forwarded-Proto': 'https' })
    .expect(200, { protocol: 'http' })

  await Supertest(server.callback())
    .get('/')
    .set({ 'X-Forwarded-Proto': 'https, http' })
    .expect(200, { protocol: 'http' })
})

test('isPjax', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      expect(request.isPjax()).toBe(false)

      request.headers().set('X-PJAX', 'true')
      expect(request.isPjax()).toBe(true)

      request.headers().set('X-PJAX', 'false')
      expect(request.isPjax()).toBe(true)

      request.headers().set('X-PJAX', true)
      expect(request.isPjax()).toBe(true)

      request.headers().set('X-PJAX', '')
      expect(request.isPjax()).toBe(false)

      request.headers().set('X-PJAX', undefined)
      expect(request.isPjax()).toBe(false)

      return response.payload('ok')
    })

  await Supertest(server.callback()).get('/').expect(200)
})

test('isAjax', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      expect(request.isAjax()).toBe(false)

      request.headers().set('X-Requested-With', 'XMLHttpRequest')
      expect(request.isAjax()).toBe(true)

      request.headers().set('X-Requested-With', '')
      expect(request.isAjax()).toBe(false)

      request.headers().set('X-Requested-With', undefined)
      expect(request.isAjax()).toBe(false)

      return response.payload('ok')
    })

  await Supertest(server.callback()).get('/').expect(200)
})

test('isPrefetch', async () => {
  const server = app
    .make(Server)
    .use(({ request, response }) => {
      expect(request.isPrefetch()).toBe(false)

      request.headers().set('X-moz', '')
      expect(request.isPrefetch()).toBe(false)

      request.headers().set('X-moz', 'prefetch')
      expect(request.isPrefetch()).toBe(true)

      request.headers().set('X-moz', 'Prefetch')
      expect(request.isPrefetch()).toBe(true)

      request.headers().remove('X-moz')

      request.headers().set('Purpose', '')
      expect(request.isPrefetch()).toBe(false)

      request.headers().set('Purpose', 'prefetch')
      expect(request.isPrefetch()).toBe(true)

      request.headers().set('Purpose', 'Prefetch')
      expect(request.isPrefetch()).toBe(true)

      return response.payload('ok')
    })

  await Supertest(server.callback()).get('/').expect(200)
})

test.run()
