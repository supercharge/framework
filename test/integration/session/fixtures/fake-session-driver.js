'use strict'

class FakeNullSessionDriver {
  start () { }

  stop () { }

  read () { }

  write () { }

  touch () { }
}

module.exports = FakeNullSessionDriver
