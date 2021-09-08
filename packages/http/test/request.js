'use strict'

const Koa = require('koa')
const Path = require('path')
const expect = require('expect')
const { test } = require('uvu')
const Supertest = require('supertest')
const { HttpContext } = require('../dist')

const testFilePath = Path.resolve(__dirname, 'middleware', 'fixtures', 'test-multipart-file-1.txt')

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

test('request.all() returns merged query params and payload', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      all: request.all(),
      query: request.query(),
      payload: request.payload()
    })
  })

  await Supertest(app.callback())
    .post('/?name=Supercharge')
    .send({ supercharge: 'is cool' })
    .expect(200, {
      query: { name: 'Supercharge' },
      payload: { supercharge: 'is cool' },
      all: { name: 'Supercharge', supercharge: 'is cool' }
    })
})

test('request.input() returns empty payload when not providing a key', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      input: request.input()
    })
  })

  const { body } = await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200)

  expect(body).toMatchObject({})
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

test.only('request.input() returns a single key from payload', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      input: request.input('name', 'Marcus')
    })
  })

  await Supertest(app.callback())
    .post('/')
    .send({ name: 'Supercharge' })
    .expect(200, { input: 'Supercharge' })
})

test('request.input() returns a single key from files', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      input: request.input('upload')
    })
  })

  const { body } = await Supertest(app.callback())
    .post('/')
    .attach('upload', testFilePath)
    .expect(200)

  expect(body).toMatchObject({
    input: {
      name: 'test-multipart-file-1.txt', size: 37
    }
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

test.run()
