'use strict'

module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  setupFilesAfterEnv: ['jest-extended'],
  collectCoverageFrom: [
    'packages/**/*.[jt]s',
    '!**/node_modules/**'
  ],
  projects: ['packages/*'],
  testMatch: ['packages/**/test/**/*.[jt]s'],
  testPathIgnorePatterns: ['packages/**/test/fixtures/*']
}
