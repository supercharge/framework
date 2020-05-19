'use strict'

const Hash = require('..')
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())

describe('HashManager', () => {
  before(() => {
    Hash.setApp(new App())
  })

  it('logs', async () => {

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
