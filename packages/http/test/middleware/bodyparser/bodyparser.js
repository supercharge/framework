
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import deepmerge from 'deepmerge'
import Supertest from 'supertest'
import { fileURLToPath } from 'node:url'
import { Server } from '../../../dist/index.js'
import { setupApp } from '../../helpers/index.js'
import defaultBodyparserConfig from './fixtures/bodyparser-config.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

const testFile1Path = Path.resolve(__dirname, './fixtures/test-multipart-file-1.txt')
const testFile2Path = Path.resolve(__dirname, './fixtures/test-multipart-file-2.txt')

function createHttpServer (bodyparserConfig) {
  const app = setupApp({
    bodyparser: deepmerge(defaultBodyparserConfig, { ...bodyparserConfig })
  })

  const server = app.make(Server)
    .use(({ request, response }) => {
      return response.payload({
        files: request.files(),
        payload: request.payload()
      })
    })

  return server.callback()
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
    .expect(200, { files: {} })
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
    createHttpServer({ multipart: { maxFileSize: '10b', maxTotalFileSize: '200b' } })
  )
    .post('/')
    .attach('uploads', testFile1Path)
    .set('Content-Type', 'multipart/form-data')
    .expect(413, 'maxFileSize exceeded')
})

test('fails when exceeding the maxTotalFileSize limit', async () => {
  await Supertest(
    createHttpServer({ multipart: { maxFileSize: '50b', maxTotalFileSize: '12b' } })
  )
    .post('/')
    .attach('uploads', testFile1Path)
    .set('Content-Type', 'multipart/form-data')
    .expect(413, 'maxTotalFileSize exceeded')
})

test('throws for unsupported content type', async () => {
  await Supertest(createHttpServer())
    .post('/')
    .set('Content-Type', 'unsupported/content-type')
    .send('hello Supercharge')
    .expect(415, 'Unsupported Content Type. Received "unsupported/content-type"')
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
  const app = setupApp({ bodyparser: defaultBodyparserConfig })

  const server = app.make(Server)

  server.router().post('/', async ctx => {
    return ctx.response.payload({
      payload: ctx.request.payload(),
      rawPayload: ctx.request.rawPayload()
    })
  })

  const response = await Supertest(server.callback())
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
