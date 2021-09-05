'use strict'

const { test } = require('uvu')
const expect = require('expect')
const { Response } = require('../dist/response')

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

test.run()
