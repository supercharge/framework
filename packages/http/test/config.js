'use strict'

const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()

describe('Http', () => {
  it('test', () => {
    expect(new App().config().server).to.equal({ host: 'localhost' })
  })
})

class App {
  config () {
    return {
      server: { host: 'localhost' }
    }
  }
}
