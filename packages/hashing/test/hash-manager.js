'use strict'

const { Hash, HashingBootstrapper } = require('../dist')

describe('HashManager', () => {
  beforeAll(() => {
    Hash.setApp(new App())
  })

  it('makes a hash', async () => {
    expect(
      await Hash.make('Supercharge')
    ).toBeDefined()
  })

  it('verifies a hash', async () => {
    const hash = await Hash.make('Supercharge')

    expect(
      await Hash.check('Supercharge', hash)
    ).toBeTrue()
  })

  it('creates an MD5 hash', () => {
    const md5 = Hash.md5('Supercharge')
    expect(md5).toBeDefined()
    expect(md5).not.toEqual('Supercharge')
  })

  it('creates a SHA256 hash', () => {
    const sha256 = Hash.sha256('Supercharge')
    expect(sha256).toBeDefined()
    expect(sha256).not.toEqual('Supercharge')
  })

  it('creates a SHA512 hash', () => {
    const sha512 = Hash.sha512('Supercharge')
    expect(sha512).toBeDefined()
    expect(sha512).not.toEqual('Supercharge')
  })

  it('can change the hash driver', async () => {
    const hash = await Hash.driver('argon').make('Supercharge')

    expect(
      await Hash.driver('argon').check('Supercharge', hash)
    ).toBeTrue()

    expect(
      await Hash.driver('bcrypt').check('Supercharge', hash)
    ).toBeFalse()
  })

  it('configures the bcrypt rounds', async () => {
    Hash.drivers = new Map()

    const hash = await Hash
      .setApp(new BcryptConfigurationApp())
      .make('Super')

    expect(hash).toBeDefined()
  })

  it('configures the argon2id driver', async () => {
    Hash.drivers = new Map()

    const hash = await Hash
      .setApp(new Argon2idConfigurationApp())
      .make('Super')

    expect(hash).toBeDefined()
  })

  it('configures the argon2i driver', async () => {
    Hash.drivers = new Map()
    Hash.setApp(new Argon2dConfigurationApp())

    const hash = await Hash.make('Super')

    expect(hash).toBeDefined()
    expect(
      await Hash.driver('argon').check('Super', hash)
    ).toBeDefined()
  })

  it('get nested', async () => {
    const app = new BootstrappedApp()
    await new HashingBootstrapper().bootstrap(app)
    expect(
      app.config().get('hashing.driver')
    ).toEqual('bootstrapped-bcrypt')
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

class BootstrappedApp {
  config () {
    return {
      get (key) {
        return key === 'hashing.driver'
          ? 'bootstrapped-bcrypt'
          : 'bcrypt'
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
          : { time: 2, threads: 2, memory: 512, algorithm: 'argon2id' }
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
          : { algorithm: 'argon2d' }
      }
    }
  }
}
