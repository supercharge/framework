'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const expect = require('expect')
const Supertest = require('supertest')
const { Response, HttpContext } = require('../dist')

const appMock = {
  make () {},
  config () {
    return {
      get () { }
    }
  }
}

test('share', () => {
  const user = { name: 'Marcus' }
  const session = { id: 1 }

  const response = new Response({ state: {} })
    .share({ user })
    .share({ session })

  expect(response.state()).toEqual({ user, session })
})

test('state', () => {
  const user = { name: 'Marcus' }
  const response = new Response({ state: {} }).share({ user })
  expect(response.state()).toEqual({ user })

  const shareKeyValue = new Response({ state: {} }).share('name', 'Marcus')
  expect(shareKeyValue.state()).toEqual({ name: 'Marcus' })
})

test('response.cookie() creates an unsigned (plain) cookie', async () => {
  const app = new Koa().use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned())
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie']).toEqual(['name=Supercharge; path=/; httponly'])
})

test('response.cookie() creates a cookie that expiresIn', async () => {
  const app = new Koa({ keys: ['abc'] }).use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresIn(5))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie'][0]).toContain('expires=')
})

test('throws on response.cookie() when not providing expiration time', async () => {
  const app = new Koa({ keys: ['abc'] }).use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresIn())
    }).toThrow('Strings and numbers are supported arguments in method "expiresIn"')

    return response.payload('ok')
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'ok')
})

test('response.cookie() creates a cookie that expiresAt', async () => {
  const app = new Koa({ keys: ['abc'] }).use(ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    return response
      .payload('ok')
      .cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt(new Date()))
  })

  const response = await Supertest(app.callback())
    .get('/')
    .expect(200)

  expect(response.headers['set-cookie'][0]).toContain('expires=')
})

test('throws on response.cookie() when not providing an argument to expiresAt', async () => {
  const app = new Koa({ keys: ['abc'] }).use(async ctx => {
    const { response } = HttpContext.wrap(ctx, appMock)

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt())
    }).toThrow('Argument in method "expiresAt" must be an instance of date')

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt(123))
    }).toThrow('Argument in method "expiresAt" must be an instance of date')

    expect(() => {
      response.cookie('name', 'Supercharge', cookie => cookie.unsigned().expiresAt('now'))
    }).toThrow('Argument in method "expiresAt" must be an instance of date')

    return response.payload('ok')
  })

  await Supertest(app.callback())
    .get('/')
    .expect(200, 'ok')
})

test.run()
