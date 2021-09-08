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

  const { body } = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(body).toMatchObject({
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

test.run()
