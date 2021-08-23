'use strict'

const { HeaderBag } = require('../dist/header-bag')

describe('HeaderBag', () => {
  it('get', () => {
    const bag = new HeaderBag({})

    expect(bag.get()).toEqual(undefined)
  })
})
