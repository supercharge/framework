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
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/triple-slash-reference': 0,
    '@typescript-eslint/strict-boolean-expressions': 0
  }
}
