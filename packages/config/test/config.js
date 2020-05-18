'use strict'

const Path = require('path')
const Config = require('..')
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const Bootstrapper = require('../bootstrapper')

const { describe, it, afterEach } = exports.lab = Lab.script()

describe('Config', () => {
  afterEach(() => {
    Config.clear()
  })

  it('all', () => {
    Config.set('app.name', 'Supercharge')
    expect(typeof Config.all()).to.equal('object')
    expect(Config.all()).to.equal({ app: { name: 'Supercharge' } })
  })

  it('get', () => {
    Config.set('key', 'value')
    expect(Config.get('key')).to.equal('value')
    expect(Config.get('unavailable')).to.equal(undefined)
  })

  it('get nested', async () => {
    await new Bootstrapper().boot(new App())
    expect(Config.get('app.nested.key')).to.equal('nested-value')
  })

  it('get defaultValue', () => {
    expect(Config.get('unavailable', 'fallback')).to.equal('fallback')
  })

  it('set', () => {
    Config.set('key', 'value')
    expect(Config.get('key')).to.equal('value')

    Config.set('key', undefined)
    expect(Config.get('key')).to.be.undefined()
  })

  it('has', () => {
    Config.set('app.port', 1234)
    Config.set('app.env', 'production')

    expect(Config.has('app.port')).to.be.true()
    expect(Config.has('app.name')).to.be.false()
    expect(Config.has('app.environment')).to.be.false()
  })

  it('initializes with values', () => {
    const Conf = new Config.constructor({ isProduction: true })

    expect(Conf.has('isProduction')).to.be.false()
  })
})

class App {
  configPath () {
    return Path.resolve(__dirname, 'fixtures/config')
  }
}
