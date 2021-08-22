'use strict'

const { Container } = require('../dist')

describe('Container', () => {
  it('throws for invalid namespace when binding an instance', () => {
    const container = new Container()

    expect(() => container.bind()).toThrow()
    expect(() => container.bind(null)).toThrow()
    expect(() => container.bind('', () => {})).toThrow()

    expect(() => container.bind({}, () => {})).not.toThrow()
    expect(container.hasBinding({})).toBeTrue()

    expect(() => container.bind(123, () => {})).not.toThrow()
    expect(container.hasBinding(123)).toBeTrue()

    expect(() => container.bind(true, () => {})).not.toThrow()
    expect(container.hasBinding(true)).toBeTrue()
  })

  it('throws when missing the factory function when binding an instance', () => {
    const container = new Container()

    expect(() => container.bind('namespace')).toThrow()
  })

  it('bind (string namespace)', () => {
    const container = new Container()

    container.bind('namespace', () => 1)
    container.bind('namespace.binding', () => 2)
    container.bind('namespace/binding', () => 3)

    expect(container.hasBinding('namespace')).toBeTrue()
    expect(container.hasBinding('namespace.binding')).toBeTrue()
    expect(container.hasBinding('namespace/binding')).toBeTrue()

    expect(container.isSingleton('namespace')).toBeFalse()

    container.singleton('singleton', () => 1)
    container.singleton('singleton.binding', () => 2)
    container.singleton('namespace.binding', () => 2)

    expect(container.isSingleton('singleton')).toBeTrue()
    expect(container.isSingleton('singleton.binding')).toBeTrue()
    expect(container.isSingleton('namespace.binding')).toBeTrue()
  })

  it('bind (class constructor as namespace)', () => {
    class User {
      constructor (data) {
        this.data = data
      }
    }

    const container = new Container()

    container.bind(User, () => {
      return new User({ name: 'Supercharge' })
    })

    expect(container.hasBinding(User)).toBeTrue()
    expect(container.make(User)).toEqual(new User({ name: 'Supercharge' }))
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

  it('make class', () => {
    class User {
      constructor (app) {
        this.app = app
      }
    }

    const container = new Container()
    const user = container.make(User)

    expect(user instanceof User).toBeTrue()
    expect(user.app).toBe(container)
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
