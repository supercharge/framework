'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const { expect } = require('expect')
const Supertest = require('supertest')
const { HttpContext, Request, Response } = require('../dist')

const appMock = {
  make (key) {
    if (key === 'request') {
      return Request
    }

    if (key === 'response') {
      return Response
    }
  },
  config () {
    return {
      get () { }
    }
  }
}

test('request.path() returns the URL path', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.path()
    )
  })

  await Supertest(app.callback())
    .get('/supercharge/123/cool')
    .expect(200, '/supercharge/123/cool')
})

test('request.query() returns the querystring', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(request.query())
  })

  await Supertest(app.callback())
    .get('/?name=Supercharge&marcus=isCool')
    .expect(200, { name: 'Supercharge', marcus: 'isCool' })
})

test('request.all() returns merged query params, payload, and files', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

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

  await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200, {
      query: { name: 'Supercharge' },
      payload: { supercharge: 'is cool' },
      files: { upload: { name: 'UploadedFile' } },
      all: { name: 'Supercharge', supercharge: 'is cool', upload: { name: 'UploadedFile' } }
    })
})

test('request.input() returns empty payload when not providing a key', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      input: request.input()
    })
  })

  const response = await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200)

  expect(response.body).toMatchObject({})
})

test('request.input() returns a single key from query params', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      input: request.input('name', 'Marcus')
    })
  })

  await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200, { input: 'Supercharge' })
})

test('request.input() returns a single key from payload', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.setPayload({ supercharge: 'is cool' })

    return response.payload({
      input: request.input('name', 'Marcus')
    })
  })

  await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200, { input: 'Supercharge' })
})

test('request.input() returns a single key from files', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.setFiles({ upload: { originalFilename: 'UploadedFile' } })

    return response.payload({
      input: request.input('upload')
    })
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({
    input: { name: 'UploadedFile' }
  })
})

test('request.input() returns a default', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      input: request.input('missing-input-key', 'Marcus')
    })
  })

  await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200, { input: 'Marcus' })
})

test('request.params() returns the path params', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.params().set('name', 'Supercharge')

    return response.payload({
      params: request.params()
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { params: { name: 'Supercharge' } })
})

test('request.param() returns the param value', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.params().set('name', 'Supercharge')

    return response.payload({
      param: request.param('name')
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { param: 'Supercharge' })
})

test('request.param() returns the param default value if it doesn’t exist', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      param: request.param('name', 'Marcus')
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { param: 'Marcus' })
})

test('request.headers()', async () => {
  const app = new Koa()
    .use(async (ctx, next) => {
      const { request } = HttpContext.wrap(ctx, appMock)

      request.headers().set('x-name', 'Supercharge')
      await next()
    })
    .use(ctx => {
      const { request, response } = HttpContext.wrap(ctx, appMock)

      return response.payload({
        headers: request.headers()
      })
    })

  const response = await Supertest(app.callback())
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

test('request.headers().all()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.headers()
      .set('foo', 'bar')
      .set('sessionId', 1)
      .set('name', 'Supercharge')
      .set('supercharge', 'is cool')

    return response.payload({
      headers: request.headers().all('name', 'foo')
    })
  })

  const response = await Supertest(app.callback())
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
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.headers().get('name', 'defaultValue')
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'defaultValue')
})

test('request.headers().has()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.headers()
      .set('sessionId', 1)
      .set('name', 'Supercharge')

    return response.payload(
      request.headers().has('name')
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'true')
})

test('request.hasHeaders()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.hasHeader('sessionId')
    )
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'false')
})

test('response.headers().remove()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    request.headers()
      .set('sessionId', 1)
      .set('name', 'Supercharge')

    return response.payload(
      request.headers().remove('name')
    )
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.body).toMatchObject({ sessionId: 1 })
  expect(response.body).not.toMatchObject({ name: 'Supercharge' })
})

test('request.cookie() returns an unsigned (plain) cookie', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      cookies: { data: request.cookie('data', cookie => cookie.unsigned()) }
    })
  })

  const response = await Supertest(app.callback())
    .get('/')
    .set('Cookie', 'data=value')
    .expect(200)

  expect(response.headers['set-cookie']).toBeUndefined()
  expect(response.body).toMatchObject({
    cookies: { data: 'value' }
  })
})

test('request.cookie() returns a signed cookie', async () => {
  const appKeys = ['abcde']
  const app = new Koa({ keys: appKeys }).use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.payload('ok').cookie('name', 'Supercharge')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .set('Cookie', 'key=value')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual([
    'name=Supercharge; path=/; httponly',
    'name.sig=vMKzqvNMXRSaFegfFMZZS4diDJM; path=/; httponly'
  ])
})

test('request.cookies().has(cookieName) determines whether a cookie exists', async () => {
  const appKeys = ['abcde']
  const app = new Koa({ keys: appKeys }).use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      fooExists: request.hasCookie('foo'),
      barExists: request.hasCookie('bar')
    })
  })

  await Supertest(app.callback())
    .get('/')
    .set('Cookie', 'foo=bar')
    .expect(200, { fooExists: true, barExists: false })
})

test('request.cookies().has(cookieName) works without request cookies', async () => {
  const appKeys = ['abcde']
  const app = new Koa({ keys: appKeys }).use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      exists: request.hasCookie('foo')
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { exists: false })
})

test('creating a cookie uses default options', async () => {
  const appKeys = ['abcde']
  const cookieTTL = 123
  const cookieOptions = {
    maxAge: cookieTTL,
    path: '/path',
    sameSite: 'lax',
    signed: false
  }

  const appMock = {
    make (key) {
      if (key === 'response') {
        return Response
      }
    },
    config  () {
      return {
        get (key) {
          if (key === 'http.cookie') {
            return cookieOptions
          }
        }
      }
    }
  }

  const app = new Koa({ keys: appKeys }).use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.payload('ok').cookie('foo', 'bar')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .set('Cookie', 'foo=bar')
    .expect(200, 'ok')

  expect(response.headers['set-cookie']).toEqual([
    `foo=bar; path=/path; expires=${new Date(Date.now() + cookieTTL).toUTCString()}; samesite=lax; httponly`
  ])
})

test('request.isJson()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.isJson()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .set('content-type', 'text/html')
    .expect(200, 'false')

  await Supertest(app.callback())
    .get('/')
    .set('content-type', 'application/json')
    .expect(200, 'true')

  await Supertest(app.callback())
    .get('/')
    .set('content-type', 'application/vnd.supercharge+json')
    .expect(200, 'true')
})

test('request.wantsJson()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.wantsJson()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .set('accept', 'text/html')
    .expect(200, 'false')

  await Supertest(app.callback())
    .get('/')
    .set('accept', 'application/json')
    .expect(200, 'true')

  await Supertest(app.callback())
    .get('/')
    .set('accept', 'application/vnd.supercharge+json')
    .expect(200, 'true')
})

test('request.wantsHtml()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.wantsHtml()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .set('accept', 'text/html')
    .expect(200, 'true')

  await Supertest(app.callback())
    .get('/')
    .set('accept', 'application/json')
    .expect(200, 'false')

  await Supertest(app.callback())
    .get('/')
    .set('accept', 'application/vnd.supercharge+json')
    .expect(200, 'false')
})

test('request.isMethodCacheable()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response
      .header('is-cacheable', request.isMethodCacheable())
      .payload({ isCacheable: request.isMethodCacheable() })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { isCacheable: true })

  const response = await Supertest(app.callback())
    .head('/')
    .expect(200)
  expect(response.headers['is-cacheable']).toBe('true')

  await Supertest(app.callback())
    .post('/')
    .expect(200, { isCacheable: false })

  await Supertest(app.callback())
    .put('/')
    .expect(200, { isCacheable: false })

  await Supertest(app.callback())
    .delete('/')
    .expect(200, { isCacheable: false })

  await Supertest(app.callback())
    .options('/')
    .expect(200, { isCacheable: false })
})

test('request.isMethodNotCacheable()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response
      .header('not-cacheable', request.isMethodNotCacheable())
      .payload({ notCacheable: request.isMethodNotCacheable() })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { notCacheable: false })

  const response = await Supertest(app.callback())
    .head('/')
    .expect(200)
  expect(response.headers['not-cacheable']).toBe('false')

  await Supertest(app.callback())
    .post('/')
    .expect(200, { notCacheable: true })

  await Supertest(app.callback())
    .put('/')
    .expect(200, { notCacheable: true })

  await Supertest(app.callback())
    .delete('/')
    .expect(200, { notCacheable: true })

  await Supertest(app.callback())
    .options('/')
    .expect(200, { notCacheable: true })
})

test('request.contentLength()', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(
      request.contentLength()
    )
  })

  await Supertest(app.callback())
    .get('/')
    .set('content-length', 123)
    .expect(200, '123')

  await Supertest(app.callback())
    .get('/')
    .expect(200, '0')
})

test('isMethod', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      isGet: request.isMethod('GET'),
      isPost: request.isMethod('POST')
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, {
      isGet: true,
      isPost: false
    })
})

test('userAgent', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      userAgent: request.userAgent()
    })
  })

  await Supertest(app.callback())
    .get('/')
    .set('user-agent', 'macOS-Supercharge-UA')
    .expect(200, {
      userAgent: 'macOS-Supercharge-UA'
    })

  await Supertest(app.callback())
    .get('/')
    .set('User-Agent', 'macOS-Supercharge-UA')
    .expect(200, {
      userAgent: 'macOS-Supercharge-UA'
    })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { })
})

test.only('querystring', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      querystring: request.queryString()
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { querystring: '' })

  await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200, { querystring: 'name=Supercharge' })
})

test.skip('url', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      url: request.url()
    })
  })

  await Supertest(app.callback())
    .get('/')
    .set('user-agent', 'macOS-Supercharge-UA')
    .expect(200, {
      userAgent: 'macOS-Supercharge-UA'
    })

  await Supertest(app.callback())
    .get('/')
    .set('User-Agent', 'macOS-Supercharge-UA')
    .expect(200, {
      userAgent: 'macOS-Supercharge-UA'
    })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { })
})

test.run()
