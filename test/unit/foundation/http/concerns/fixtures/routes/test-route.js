'use strict'

module.exports = {
  method: 'GET',
  path: '/test-route',
  handler: () => {
    return `
      Are you supercharging through the tests?
      That is great and shows your interest.
      Thank you!
    `
  }
}
