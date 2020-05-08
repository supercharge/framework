'use strict'

const Path = require('path')
const Config = require('..')
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')

const { describe, it, afterEach } = exports.lab = Lab.script()

describe('Config', () => {
  afterEach(() => {
    Config.clear()
  })

  it('loadFrom', () => {
    Config.loadFrom(
      Path.resolve(__dirname, 'fixtures/config')
    )

    expect(Config.get('test.testing')).to.be.true()
    expect(Config.get('app.name')).to.equal('Supercharge Config')
  })

  it('loadFrom', () => {
    Config.set('app.name', 'Supercharge')

    expect(typeof Config.plain()).to.equal('object')
    expect(Config.plain()).to.equal({ app: { name: 'Supercharge' } })
  })

  it('get', () => {
    Config.set('key', 'value')
    expect(Config.get('key')).to.equal('value')
    expect(Config.get('unavailable')).to.equal(undefined)
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
    const Conf = new Config.constructor({ isProduction: false })

    expect(Conf.has('isProduction')).to.be.true()
    expect(Conf.get('isProduction')).to.equal(false)
  })

  it('initializes without values', () => {
    const Conf = new Config.constructor(null)

    expect(Conf.plain()).to.equal({})
  })
})
