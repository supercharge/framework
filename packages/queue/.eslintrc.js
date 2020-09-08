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
    '@typescript-eslint/require-await': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/method-signature-style': ['error', 'method']
  }
}
