'use strict'

const { expect } = require('expect')
const { test } = require('@japa/runner')
const { SessionConfig } = require('../dist')

test.group('Session Config', () => {
  test('plain', async () => {
    const options = { name: 'supercharge-session', lifetime: 60 }
    const config = new SessionConfig(options)

    expect(config.plain()).toEqual(options)
  })

  test('driver', async () => {
    expect(new SessionConfig({ driver: null }).driver()).toEqual('')
    expect(new SessionConfig({ driver: undefined }).driver()).toEqual('')

    expect(new SessionConfig({ driver: '' }).driver()).toEqual('')
    expect(new SessionConfig({ driver: 'cookie' }).driver()).toEqual('cookie')
    expect(new SessionConfig({ driver: 'memory' }).driver()).toEqual('memory')
  })

  test('throws when missing the session cookie name', async () => {
    const config = new SessionConfig({ name: '' })

    expect(() => {
      config.name()
    }).toThrow('Session cookie "name" is required. Received "". Configure it in your "config/session.ts" file.')
  })

  test('throws when lifetime is neither time string nor number', async () => {
    const config = new SessionConfig({ lifetime: undefined })

    expect(() => {
      config.lifetime()
    }).toThrow('Session lifetime value is neither a string nor a number. Received "undefined". Configure it in your "config/session.ts" file.')
  })

  test('returns lifetime in seconds from string', async () => {
    expect(
      new SessionConfig({ lifetime: '10s' }).lifetime()
    ).toBe(10)

    expect(
      new SessionConfig({ lifetime: '20 min' }).lifetime()
    ).toBe(20 * 60)

    expect(
      new SessionConfig({ lifetime: '1 hour' }).lifetime()
    ).toBe(60 * 60)
  })

  test('throws for lifetime from invalid string', async () => {
    expect(() => {
      new SessionConfig({ lifetime: 'foo' }).lifetime()
    }).toThrow('Invalid session lifetime value. Received "foo". Configure it in your "config/session.ts" file.')

    expect(
      new SessionConfig({ lifetime: '20 min' }).lifetime()
    ).toBe(20 * 60)

    expect(
      new SessionConfig({ lifetime: '1 hour' }).lifetime()
    ).toBe(60 * 60)
  })

  test('returns lifetime in seconds from number', async () => {
    expect(
      new SessionConfig({ lifetime: 60 * 60 }).lifetime()
    ).toBe(60 * 60)
  })

  test('returns plain cookie config', async () => {
    const cookieconfig = {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax'
    }

    const config = new SessionConfig({
      cookie: cookieconfig
    })

    expect(config.cookie().plain()).toEqual(cookieconfig)
  })

  test('returns the cookie path', async () => {
    expect(new SessionConfig({
      cookie: { path: '/' }
    }).cookie().path()).toEqual('/')

    expect(new SessionConfig({
      cookie: { path: '/path' }
    }).cookie().path()).toEqual('/path')

    expect(new SessionConfig({
      cookie: { path: null }
    }).cookie().path()).toEqual('/')

    expect(new SessionConfig({
      cookie: { path: undefined }
    }).cookie().path()).toEqual('/')
  })

  test('returns the cookie domain', async () => {
    expect(new SessionConfig({
      cookie: { domain: 'www.domain.tld' }
    }).cookie().domain()).toEqual('www.domain.tld')

    expect(new SessionConfig({
      cookie: { domain: 'domain.tld/path' }
    }).cookie().domain()).toEqual('domain.tld/path')

    expect(new SessionConfig({
      cookie: { domain: null }
    }).cookie().domain()).toEqual('')

    expect(new SessionConfig({
      cookie: { domain: undefined }
    }).cookie().domain()).toEqual('')
  })

  test('cookie is secure', async () => {
    expect(new SessionConfig({
      cookie: { secure: false }
    }).cookie().isSecure()).toEqual(false)

    expect(new SessionConfig({
      cookie: { secure: true }
    }).cookie().isSecure()).toEqual(true)

    expect(new SessionConfig({
      cookie: { secure: null }
    }).cookie().isSecure()).toEqual(false)

    expect(new SessionConfig({
      cookie: { secure: undefined }
    }).cookie().isSecure()).toEqual(false)
  })

  test('cookie is httpOnly', async () => {
    expect(new SessionConfig({
      cookie: { httpOnly: false }
    }).cookie().httpOnly()).toEqual(false)

    expect(new SessionConfig({
      cookie: { httpOnly: true }
    }).cookie().httpOnly()).toEqual(true)

    expect(new SessionConfig({
      cookie: { httpOnly: null }
    }).cookie().httpOnly()).toEqual(true)

    expect(new SessionConfig({
      cookie: { httpOnly: undefined }
    }).cookie().httpOnly()).toEqual(true)
  })

  test('throws for invalid sameSite value as number', async () => {
    const cookie = { sameSite: 123 }
    const config = new SessionConfig({ cookie })

    expect(() => {
      config.cookie().sameSite()
    }).toThrow('Session cookie "sameSite" attribute must be a string or boolean. Received "123". Configure it in your "config/session.ts" file.')
  })

  test('throws for empty sameSite value', async () => {
    const cookie = { sameSite: '' }
    const config = new SessionConfig({ cookie })

    expect(() => {
      config.cookie().sameSite()
    }).toThrow('Invalid sameSite value. Received "". Configure it in your "config/session.ts" file.')
  })

  test('throws for invalid sameSite value', async () => {
    const cookie = { sameSite: 'relaxed' }
    const config = new SessionConfig({ cookie })

    expect(() => {
      config.cookie().sameSite()
    }).toThrow('Invalid sameSite value. Received "relaxed". Configure it in your "config/session.ts" file.')
  })

  test('sameSite value from string', async () => {
    expect(new SessionConfig({
      cookie: { sameSite: 'strict' }
    }).cookie().sameSite()).toEqual('strict')

    expect(new SessionConfig({
      cookie: { sameSite: 'lax' }
    }).cookie().sameSite()).toEqual('lax')

    expect(new SessionConfig({
      cookie: { sameSite: 'none' }
    }).cookie().sameSite()).toEqual('none')
  })

  test('sameSite value from boolean', async () => {
    expect(new SessionConfig({
      cookie: { sameSite: true }
    }).cookie().sameSite()).toEqual('strict')

    expect(new SessionConfig({
      cookie: { sameSite: false }
    }).cookie().sameSite()).toEqual('none')
  })
})
