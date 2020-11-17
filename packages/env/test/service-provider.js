'use strict'

const { EnvServiceProvider } = require('../dist/src')

const spy = jest.fn()

class App {
  container () {
    return { singleton: spy }
  }
}

describe('Env', () => {
  it('registers env to the container', async () => {
    const app = new App()

    const provider = new EnvServiceProvider(app)
    provider.register()

    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0]).toInclude('supercharge/env')
  })
})
