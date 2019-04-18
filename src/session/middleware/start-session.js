'use strict'

const Config = require('../../config')

class StartSession {
  constructor () {
    this.config = Config.get('session')
  }

  /**
   * Initialize a new session for the request
   * or load previously stored data from
   * the session store.
   *
   * @param {Request} request
   * @param {Toolkit} h
   */
  async onPreAuth (request, h) {
    await request.session.initialize()

    return h.continue
  }

  async onPreResponse (request, h) {
    if (!request.session.isDirty) {
      return h.continue
    }

    const response = request.response

    this.addCookieToResponse(response)
    this.saveSession(request.session)

    return h.continue
  }

  addCookieToResponse (request) {
    //
  }

  saveSession (request) {
    //
  }
}

module.exports = StartSession
