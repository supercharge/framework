
module.exports = {
  env: {
    node: true,
    es2020: true
  },
  extends: [
    '@supercharge/typescript'
  ],
  rules: {
    '@typescript-eslint/return-await': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-invalid-void-type': 0,
    '@typescript-eslint/triple-slash-reference': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/restrict-template-expressions': 0
    // '@typescript-eslint/restrict-template-expressions': ['error', { allowNullish: true }]
  }
}
