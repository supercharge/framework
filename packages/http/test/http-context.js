'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const Supertest = require('supertest')
const { HttpContext, Response } = require('../dist')

const appMock = {
  make (key) {
    if (key === 'response') {
      return Response
    }
  },
  config () {
    return {
      get () {}
    }
  }
}

test('returns the raw context', async () => {
  const app = new Koa().use(ctx => {
    const { raw, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      isEqual: ctx === raw
    })
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, { isEqual: true })
})

test.run()
