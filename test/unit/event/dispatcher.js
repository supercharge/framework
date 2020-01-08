'use strict'

const Path = require('path')
const BaseTest = require('../../../base-test')
const Dispatcher = require('../../../event/dispatcher')
const TestEvent = require('./fixtures/events/test-event')

class EventDispatcherTest extends BaseTest {
  before () {
    Dispatcher.removeAllListeners()
  }

  alwaysAfter () {
    Dispatcher.removeAllListeners()
  }

  async serialLoadsEventsAndListeners (t) {
    Dispatcher.eventsFolder = Path.resolve(__dirname, 'fixtures', 'events')
    Dispatcher.listenersFolder = Path.resolve(__dirname, 'fixtures', 'listeners')

    await Dispatcher.discoverEventsAndListeners()

    const eventName = new TestEvent().emit()

    t.is(Dispatcher.eventNames().length, 1)
    t.true(Dispatcher.eventNames().includes(eventName))

    t.is(Dispatcher.listenerCount(eventName), 1)
    t.is(Dispatcher.listeners(eventName).length, 1)
  }

  async serialLoadsNeitherEventsNorListeners (t) {
    Dispatcher.eventsFolder = Path.resolve(__dirname, 'unavailable')
    Dispatcher.listenersFolder = Path.resolve(__dirname, 'unavailable')

    await Dispatcher.discoverEventsAndListeners()

    t.is(Dispatcher.listenerCount(), 0)
  }

  async serialFireEvent (t) {
    Dispatcher.eventsFolder = Path.resolve(__dirname, 'fixtures', 'events')
    Dispatcher.listenersFolder = Path.resolve(__dirname, 'fixtures', 'listeners')

    await Dispatcher.discoverEventsAndListeners()

    const event = new TestEvent()
    const spy = this.spy(event, 'emit')

    await Dispatcher.fire(event)
    t.true(spy.called)
  }

  async ensureEvent (t) {
    class NoEvent {}
    t.throws(() => Dispatcher.ensureEvent(new NoEvent()))
  }

  async ensureListener (t) {
    class NoListener {}
    t.throws(() => Dispatcher.ensureListener(new NoListener()))
  }

  async throwsListenWithoutEventName (t) {
    t.throws(() => Dispatcher.listen())
  }

  async throwsListenWithoutHandler (t) {
    t.throws(() => Dispatcher.listen('event.name'))
  }

  async setsMaxListener (t) {
    t.is(Dispatcher.getMaxListeners(), 10)
    Dispatcher.setMaxListeners(25)
    t.is(Dispatcher.getMaxListeners(), 25)
  }

  async increasesMaxListeners (t) {
    Dispatcher.on('increase.listeners', () => { })
    Dispatcher.setMaxListeners(1)
    Dispatcher.on('increase.listeners', () => { })
    t.is(Dispatcher.getMaxListeners(), 11)
  }

  async serialEmitOnce (t) {
    const spy = this.spy()
    Dispatcher.once('once.event', spy)

    Dispatcher.fire('once.event')
    Dispatcher.fire('once.event')

    t.true(spy.calledOnce)
  }

  async prependListener (t) {
    const alltime = this.spy()
    Dispatcher.prependListener('event.prepend', alltime)
    const once = this.spy()
    Dispatcher.prependOnceListener('event.prepend', once)

    const listeners = Dispatcher.listeners('event.prepend')
    t.is(listeners[0], once)
    t.is(listeners[1], alltime)

    Dispatcher.fire('event.prepend')
    Dispatcher.fire('event.prepend')

    t.true(once.calledOnce)
    t.true(alltime.calledTwice)
  }

  async serialHandleSystemEventsListeners (t) {
    Dispatcher.listenersFolder = Path.resolve(__dirname, 'fixtures', 'system-listeners')

    await Dispatcher.discoverEventsAndListeners()

    t.true(process.eventNames().includes('system.test.event'))
  }
}

module.exports = new EventDispatcherTest()
