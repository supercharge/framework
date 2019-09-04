'use strict'

const Dispatcher = require('./dispatcher')

class EventBootstrapper {
  /**
   * At first, register the core event listeners. Afterwards,
   * discover the user-land events and listeners and
   * assign both to the event dispatcher.
   */
  async boot () {
    await Dispatcher.discoverEventsAndListeners()
  }
}

module.exports = EventBootstrapper
