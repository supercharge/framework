'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Server } = require('../dist')
const Supertest = require('supertest')
const { setupApp } = require('./helpers')

let app = setupApp()

test.before.each(() => {
  app = setupApp()
})

test('redirect is chainable', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().to('/path').withPayload()
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(307)

  expect(response.headers.location).toEqual('/path')
})

test('redirect.back()', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().back()
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/')
})

test('redirect.back() with fallback', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().back({ fallback: '/login' })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(302)

  expect(response.headers.location).toEqual('/login')
})

test('redirect.permanent()', async () => {
  const server = app
    .make(Server)
    .use(({ response }) => {
      return response.redirect().permanent().to('/permanent-path')
    })

  const response = await Supertest(server.callback())
    .get('/')
    .expect(301)

  expect(response.headers.location).toEqual('/permanent-path')
})

test.run()
