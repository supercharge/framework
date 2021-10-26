'use strict'

const { test } = require('uvu')
const expect = require('expect')
const { HttpContext, HttpRedirect } = require('../dist')

const appMock = {
  make () {},
  config () {
    return {
      get () { }
    }
  }
}

test.skip('redirect is chainable', async () => {
  const ctx = {}
  const redirect = new HttpRedirect(ctx)

  expect(
    redirect.to('/path').withPayload()
  ).toBeInstanceOf(HttpRedirect)
})

test.skip('response.redirect(withUrl)', async () => {
  const ctx = {}
  const { response } = HttpContext.wrap(ctx, appMock)

  expect(response.redirect('/to')).toBeInstanceOf(HttpRedirect)
})

test.run()
