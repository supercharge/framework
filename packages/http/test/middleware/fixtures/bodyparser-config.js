'use strict'

module.exports = {
  encoding: 'utf-8',
  methods: ['POST', 'PUT', 'PATCH'],

  json: {
    limit: '1mb',
    strict: true
  },

  text: {
    limit: '56kb'
  },

  formUrlEncoded: {
    limit: '56kb'
  }
}
