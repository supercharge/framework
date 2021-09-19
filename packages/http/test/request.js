'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const expect = require('expect')
const Supertest = require('supertest')
const { HttpContext } = require('../dist')

const appMock = {
  make () {},
  config () {
    return {
      get () { }
    }
  }
}

test('request querystring', async () => {
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
      .setFiles({ upload: { name: 'UploadedFile' } })

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

    request.setFiles({ upload: { name: 'UploadedFile' } })

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

  expect(response.body.headers).toMatchObject({
    headers: {
      'x-testing': 'foo',
      'x-name': 'Supercharge'
    }
  })
})

test.run()
