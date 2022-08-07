'use strict'

const { defineConfig } = require('vitest/config')

module.exports = defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'html']
    }
  }
})
