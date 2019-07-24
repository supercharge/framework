'use strict'

class StartSession {
  /**
   * Initialize a new session for the request
   * or load previously stored data from
   * the session store.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  async onPreAuth (request, h) {
    await request.session._initialize()

    return h.continue
  }

  /**
   * Persist the requests’s session data
   * in the defined data store.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  async onPreResponse (request, h) {
    await request.session._persist(h)

    return h.continue
  }
}

module.exports = StartSession
