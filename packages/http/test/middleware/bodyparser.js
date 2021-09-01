'use strict'

const Koa = require('koa')
const Path = require('path')
const { test } = require('uvu')
const expect = require('expect')
const Supertest = require('supertest')
const { createServer } = require('http')
const BodyparserConfig = require('./fixtures/bodyparser-config')
const { BodyparserMiddleware, HttpContext } = require('../../dist')

const uploadFilePath = Path.resolve(__dirname, 'fixtures', 'test-multipart-file.txt')

const appMock = {
  make () {},
  config () {
    return {
      get () {
        return BodyparserConfig
      }
    }
  }
}

const app = new Koa()
  .use(async (ctx, next) => {
    const context = HttpContext.wrap(ctx, appMock)

    await new BodyparserMiddleware(appMock).handle(context, async () => {
      context.response.payload(context.request.payload)
    })

    await next()
  })

const server = createServer(app.callback())

test('parse json body', async () => {
  await Supertest(server)
    .post('/')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ hello: 'Supercharge' }))
    .expect(200, { hello: 'Supercharge' })
    .expect('content-type', 'application/json; charset=utf-8')
})

test('proceeds request without a body', async () => {
  await Supertest(server)
    .post('/')
    .set('Content-Type', 'application/json')
    .expect(200, {})
})

test('parse urlencoded body', async () => {
  await Supertest(server)
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send('hello=Supercharge')
    .expect(200, { hello: 'Supercharge' })
})

test('parse text body', async () => {
  await Supertest(server)
    .post('/')
    .set('Content-Type', 'text/plain')
    .send('hello Supercharge')
    .expect(200, 'hello Supercharge')
})

test('parse multipart formdata', async () => {
  const app = new Koa().use(async (ctx, next) => {
    const context = HttpContext.wrap(ctx, appMock)

    await new BodyparserMiddleware(appMock).handle(context, async () => {
      context.response.payload(context.request.files())
    })

    await next()
  })

  const server = createServer(app.callback())

  const { body: files } = await Supertest(server)
    .post('/')
    .attach('upload', uploadFilePath)
    .set('Content-Type', 'multipart/form-data')
    .expect(200)

  expect(Object.keys(files)).toEqual(['upload'])
  expect(files).toMatchObject({
    upload: { name: 'test-multipart-file.txt', size: 37 }
  })
})

// test('parse multiple files in multipart formdata', async () => {
//   let files

//   const app = new Koa()
//     .use(async (ctx, next) => {
//       const context = HttpContext.wrap(ctx, appMock)

//       console.log({ contentType: context.request.contentType() })

//       await new BodyparserMiddleware(appMock).handle(context, async () => {
//         files = context.request.files()
//         context.response.payload(context.request.files())
//       })

//       await next()
//     })

//   const server = createServer(app.callback())

//   console.log({ files })

//   await Supertest(server)
//     .post('/')
//     .attach('package[]', packageFilePath)
//     .set('Content-Type', 'multipart/form-data')
//     .expect(200, { package: {} })
// })

test('throws for unsupported content type', async () => {
  await Supertest(server)
    .post('/')
    .set('Content-Type', 'unsupported/content-type')
    .send('hello Supercharge')
    .expect(415, 'Unsupported Media Type')
})

test('fails when posting data without content-type headers', async () => {
  await Supertest(server)
    .post('/')
    .expect(415, 'Unsupported Media Type')
})

test('skips parsing on GET request', async () => {
  await Supertest(server).get('/').expect(204)
})

test('skips parsing on DELETE request', async () => {
  await Supertest(server).delete('/').expect(204)
})

test.run()
