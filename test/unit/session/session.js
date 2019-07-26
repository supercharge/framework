'use strict'

const BaseTest = require('../../../base-test')
const Session = require('../../../session/session')

class SessionTest extends BaseTest {
  _options () {
    return {
      config: {
        cookie: { name: 'supercharge-test-cookie', options: {} }
      }
    }
  }

  sessionManagement (t) {
    const session = new Session(this._options())

    session.set('name', 'Marcus')
    t.true(session.isDirty)
    t.deepEqual(session.store, { name: 'Marcus' })

    t.true(session.has('name'))
    t.false(session.has('unknown-key'))

    t.deepEqual(session.get('name'), 'Marcus')
    t.deepEqual(session.get('unknown-key', 'default'), 'default')

    session.set('likesNode', true)
    t.deepEqual(session.all(), { name: 'Marcus', likesNode: true })

    const likesNode = session.pull('likesNode')
    t.true(likesNode)
    t.deepEqual(session.all(), { name: 'Marcus' })

    session.set('feels', 'supercharged')
    session.forget('unknown')
    t.deepEqual(session.all(), { name: 'Marcus', feels: 'supercharged' })
    session.forget('feels')
    t.deepEqual(session.all(), { name: 'Marcus' })

    session.clear()
    t.deepEqual(session.all(), { })
  }

  sessionTouch (t) {
    const session = new Session(this._options())
    t.false(session.isDirty)

    session.touch()
    t.true(session.isDirty)
  }
}

module.exports = new SessionTest()
