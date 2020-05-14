'use strict'

const Hash = require('..')
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())

describe('HashManager', () => {
  before(() => {
    Hash.setApp(new App())
  })

  it('makes a hash', async () => {
    expect(
      await Hash.make('Supercharge')
    ).to.exist()
  })

  it('verifies a hash', async () => {
    const hash = await Hash.make('Supercharge')

    expect(
      await Hash.check('Supercharge', hash)
    ).to.be.true()
  })

  it('creates an MD5 hash', () => {
    expect(
      Hash.md5('Supercharge')
    )
      .to.exist()
      .and.not.equal('Supercharge')
  })

  it('creates a SHA256 hash', () => {
    expect(
      Hash.sha256('Supercharge')
    )
      .to.exist()
      .and.not.equal('Supercharge')
  })

  it('creates a SHA512 hash', () => {
    expect(
      Hash.sha512('Supercharge')
    )
      .to.exist()
      .and.not.equal('Supercharge')
  })

  it('can change the hash driver', async () => {
    const hash = await Hash.driver('argon').make('Supercharge')

    expect(
      await Hash.driver('argon').check('Supercharge', hash)
    ).to.be.true()

    expect(
      await Hash.driver('bcrypt').check('Supercharge', hash)
    ).to.be.false()
  })

  it('configures the bcrypt rounds', async () => {
    Hash.drivers = new Map()

    const hash = await Hash
      .setApp(new BcryptConfigurationApp())
      .make('Super')

    expect(hash).to.exist()
  })

  it('configures the argon2id driver', async () => {
    Hash.drivers = new Map()

    const hash = await Hash
      .setApp(new Argon2idConfigurationApp())
      .make('Super')

    expect(hash).to.exist()
  })

  it('configures the argon2i driver', async () => {
    Hash.drivers = new Map()
    Hash.setApp(new Argon2dConfigurationApp())

    const hash = await Hash.make('Super')

    expect(hash).to.exist()
    expect(
      await Hash.driver('argon').check('Super', hash)
    ).to.exist()
  })
})

class App {
  config () {
    return {
      get () {
        return 'bcrypt'
      }
    }
  }
}

class BcryptConfigurationApp {
  config () {
    return {
      get (configItem) {
        return configItem === 'hashing.driver'
          ? 'bcrypt'
          : { rounds: 10 }
      }
    }
  }
}

class Argon2idConfigurationApp {
  config () {
    return {
      get (configItem) {
        return configItem === 'hashing.driver'
          ? 'argon'
          : { time: 2, threads: 2, memory: 512, type: 'argon2id' }
      }
    }
  }
}

class Argon2dConfigurationApp {
  config () {
    return {
      get (configItem) {
        return configItem === 'hashing.driver'
          ? 'argon'
          : { type: 'argon2d' }
      }
    }
  }
}
