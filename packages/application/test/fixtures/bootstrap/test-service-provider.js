
class TestServiceProvider {
  register (app) {
    app.bind('test-register', () => {
      return true
    })
  }

  boot (app) {
    app.bind('test-boot', () => {
      return true
    })
  }

  /**
   * Both functions are placeholders which are implemented in the `ServiceProvider`
   * base class from the @supercharge/support package.
   */
  callBootingCallbacks () {}
  callBootedCallbacks () {}
}

module.exports = TestServiceProvider
