'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const { expect } = require('expect')
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
      get () { }
    }
  }
}

test('redirect is chainable', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.redirect().to('/path').withPayload()
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(307)

  expect(response.headers.location).toEqual('/path')
})

test('redirect.back()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.redirect().back()
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/')
})

test('redirect.back() with fallback', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.redirect().back({ fallback: '/login' })
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/login')
})

test('redirect.permanent()', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response.redirect().permanent().to('/permanent-path')
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(301)

  expect(response.headers.location).toEqual('/permanent-path')
})

test.run()
