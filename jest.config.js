'use strict'

module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: [
    '**/packages/*/**/*.js',
    '**/packages/*/**/*.ts'
  ],

  roots: ['<rootDir>packages'],
  modulePathIgnorePatterns: ['dist'],

  setupFilesAfterEnv: ['jest-extended'],

  testMatch: ['<rootDir>/packages/**/test/**/*.[jt]s'],
  testPathIgnorePatterns: [
    // '<rootDir>/packages/**/coverage/**/*.[jt]s',
    'packages/config/test/fixtures',
    'packages/env/test/fixtures'
  ]
}
