'use strict'

module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['<rootDir>/dist/**/*.js'],

  setupFilesAfterEnv: ['jest-extended'],

  testMatch: ['<rootDir>/test/**/*.[jt]s'],
  testPathIgnorePatterns: ['<rootDir>/test/fixtures']
}
