'use strict'

module.exports = {
  env: {
    node: true,
    es2020: true
  },
  extends: [
    '@supercharge/typescript'
  ],
  rules: {
    '@typescript-eslint/strict-boolean-expressions': 0
  }
}
