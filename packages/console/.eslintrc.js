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
    '@typescript-eslint/require-await': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-extraneous-class': 0,
    '@typescript-eslint/strict-boolean-expressions': 0
  }
}
