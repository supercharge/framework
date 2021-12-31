'use strict'

module.exports = {
  env: {
    node: true,
    es2020: true
  },
  extends: [
    '@supercharge/typescript'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/triple-slash-reference': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/restrict-template-expressions': 0
  }
}
