'use strict'

const { Container } = require('../dist')

describe('Container', () => {
  it('throws for missing namespace when binding an instance', () => {
    const container = new Container()

    expect(() => container.bind()).toThrow()
  })

  it('throws for missing the factory function when binding an instance', () => {
    const container = new Container()

    expect(() => container.bind('namespace')).toThrow()
  })

  it('bind', () => {
    const container = new Container()

    container.bind('namespace', () => 1)

    expect(container.hasBinding('namespace')).toBeTrue()
    expect(container.hasSingletonBinding('namespace')).toBeFalse()
  })

  it('make', () => {
    const container = new Container()

    container.bind('namespace', () => 1)

    expect(container.make('namespace')).toBe(1)
    expect(() => container.make('not-bound')).toThrow('Missing container binding')
  })

  it('make singleton', () => {
    const container = new Container()

    container.singleton('singleton', () => {
      return new Singleton()
    })

    expect(container.make('singleton')).toBe(container.make('singleton'))
  })

  it('throws for missing namespace when binding a singleton', () => {
    const container = new Container()

    expect(() => container.singleton()).toThrow()
  })

  it('flush', () => {
    const container = new Container()

    container.bind('binding', () => 1)
    container.singleton('singleton', () => 1)

    expect(container.hasBinding('binding')).toBeTrue()
    expect(container.isSingleton('singleton')).toBeTrue()

    container.flush()

    expect(container.hasBinding('binding')).toBeFalse()
    expect(container.isSingleton('singleton')).toBeFalse()
  })
})

class Singleton {}
