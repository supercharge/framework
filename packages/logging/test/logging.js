'use strict'

const Logger = require('..')
const Lab = require('@hapi/lab')
// const { expect } = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())

describe('Logger', () => {
  before(() => {
    Logger.setApp(new App())
  })

  it('logs', async () => {
    // expect(Logger.debug('hello world.')).to.exist()
  })
})

class App {
  config () {
    return {
      get () {
        return 'console'
      }
    }
  }
}
