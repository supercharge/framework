'use strict'

module.exports = {
  env: {
    node: true,
    jest: true,
    es2020: true
  },
  extends: [
    'standard-with-typescript'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'node/no-callback-literal': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/method-signature-style': 0,
    '@typescript-eslint/triple-slash-reference': 0,
    '@typescript-eslint/strict-boolean-expressions': 0

  }
}
