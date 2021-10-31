'use strict'

const Koa = require('koa')
const Path = require('path')
const { test } = require('uvu')
const expect = require('expect')
const deepmerge = require('deepmerge')
const Supertest = require('supertest')
const { BodyparserMiddleware, HttpContext } = require('../../../dist')
const defaultBodyparserConfig = require('./fixtures/bodyparser-config')

const testFile1Path = Path.resolve(__dirname, 'fixtures', 'test-multipart-file-1.txt')
const testFile2Path = Path.resolve(__dirname, 'fixtures', 'test-multipart-file-2.txt')

function createAppMock (bodyparserConfig = {}) {
  return {
    make () {},
    config () {
      return {
        get () {
          return deepmerge.all([{}, defaultBodyparserConfig, bodyparserConfig])
        }
      }
    }
  }
}

function createHttpServer (bodyparserConfig) {
  const appMock = createAppMock(bodyparserConfig)

  const app = new Koa().use(async (ctx, next) => {
    const context = HttpContext.wrap(ctx, appMock)

    try {
      await new BodyparserMiddleware(appMock).handle(context, async () => {
        context.response.payload({
          files: context.request.files(),
          payload: context.request.payload()
        })
      })
    } catch (error) {
      return error.status
        ? context.response.throw(error.status, error.message)
        : context.response.throw(error)
    }

    await next()
  })

  return app.callback()
}

test('parse json body', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'application/json')
    .send({ hello: 'Supercharge' })
    .expect(200, { payload: { hello: 'Supercharge' }, files: {} })
    .expect('content-type', 'application/json; charset=utf-8')
})

test('parse json body stringified', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ hello: 'Supercharge' }))
    .expect(200, { payload: { hello: 'Supercharge' }, files: {} })
    .expect('content-type', 'application/json; charset=utf-8')
})

test('fails when exceeding the JSON limit', async () => {
  await Supertest(
    createHttpServer({ json: { limit: '10b' } })
  )
    .post('/')
    .set('Content-Type', 'application/json')
    .send({ something: 'larger than 10 bytes' })
    .expect(413, 'Payload Too Large')
})

test('proceeds request without a body', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'application/json')
    .expect(200, { payload: {}, files: {} })
})

test('parse urlencoded body from string', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send('hello=Supercharge')
    .expect(200, { payload: { hello: 'Supercharge' }, files: {} })
})

test('parse urlencoded body from object', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({ hello: 'Supercharge' })
    .expect(200, { payload: { hello: 'Supercharge' }, files: {} })
})

test('fails when exceeding form limit', async () => {
  await Supertest(
    // createHttpServer({ form: { limit: '10b' } })
    createHttpServer({ form: { limit: '10b' } })
  )
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({ something: 'larger than 10 bytes' })
    .expect(413, 'Payload Too Large')
})

test('parse text body', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'text/plain')
    .send('hello Supercharge')
    .expect(200, { payload: 'hello Supercharge', files: {} })
})

test('fails when exceeding the text limit', async () => {
  await Supertest(
    createHttpServer({ text: { limit: '10b' } })
  )
    .post('/')
    .set('Content-Type', 'text/plain')
    .send('something larger than 10 bytes')
    .expect(413, 'Payload Too Large')
})

test('parse multipart files', async () => {
  const { body } = await Supertest(createHttpServer())
    .post('/')
    .attach('upload', testFile1Path)
    .set('Content-Type', 'multipart/form-data')
    .expect(200)

  expect(body.payload).toEqual({})
  expect(body.files).toMatchObject({ upload: { name: 'test-multipart-file-1.txt', size: 37 } })
})

test('parse multipart fields', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .field('name', 'Supercharge')
    .field('isAwesome', 1)
    .set('Content-Type', 'multipart/form-data')
    .expect(200, { files: {}, payload: { name: 'Supercharge', isAwesome: '1' } })
})

// test('fails when exceeding maxFields ', async () => {
//   await Supertest(createHttpServer({ multipart: { maxFields: 1 } }))
//     .post('/')
//     .field('user', 'Marcus')
//     .field('name', 'Supercharge')
//     .set('Content-Type', 'multipart/form-data')
//     .expect(500)
// })

test('parse multipart fields and files', async () => {
  const { body } = await Supertest(createHttpServer())
    .post('/')
    .field('user', 'Marcus')
    .field('name', 'Supercharge')
    .attach('uploads', testFile1Path)
    .attach('uploads', testFile2Path)
    .set('Content-Type', 'multipart/form-data')
    .expect(200)

  expect(body.payload).toEqual({ name: 'Supercharge', user: 'Marcus' })
  expect(body.files).toMatchObject({
    uploads: [
      { name: 'test-multipart-file-1.txt', size: 37 },
      { name: 'test-multipart-file-2.txt', size: 45 }
    ]
  })
})

test('fails when exceeding the maxFileSize limit', async () => {
  await Supertest(
    createHttpServer({ multipart: { maxFileSize: '10b' } })
  )
    .post('/')
    .attach('uploads', testFile1Path)
    .set('Content-Type', 'multipart/form-data')
    .expect(413, 'maxFileSize exceeded')
})

test('throws for unsupported content type', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'unsupported/content-type')
    .send('hello Supercharge')
    .expect(415, 'Unsupported Content Type. Received "unsupported/content-type"')
})

test('fails when posting data without content-type headers', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .expect(415, 'Unsupported Content Type. Received ""')
})

test('skips parsing on GET request', async () => {
  await Supertest(createHttpServer())
    .get('/?hello=Supercharge')
    .expect(200, { files: {} })
})

test('skips parsing on DELETE request', async () => {
  await Supertest(createHttpServer())
    .delete('/?hello=Supercharge')
    .expect(200, { files: {} })
})

test('skips parsing on DELETE request', async () => {
  await Supertest(createHttpServer())
    .delete('/?hello=Supercharge')
    .expect(200, { files: {} })
})

test('sets the raw request payload', async () => {
  const appMock = createAppMock()
  const app = new Koa().use(async (ctx, next) => {
    const context = HttpContext.wrap(ctx, appMock)

    await new BodyparserMiddleware(appMock).handle(context, async () => {
      context.response.payload({
        payload: context.request.payload(),
        rawPayload: context.request.rawPayload()
      })
    })

    await next()
  })

  const response = await Supertest(app.callback())
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send('hello=Supercharge')
    .expect(200)

  expect(response.body).toEqual({
    rawPayload: 'hello=Supercharge',
    payload: { hello: 'Supercharge' }
  })
})

test.run()
