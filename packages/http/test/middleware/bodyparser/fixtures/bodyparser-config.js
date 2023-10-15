
module.exports = {
  encoding: 'utf-8',
  methods: ['POST', 'PUT', 'PATCH'],

  json: {
    limit: '1mb',
    contentTypes: [
      'application/json',
      'application/*+json',
      'application/csp-report'
    ]
  },

  text: {
    limit: '56kb',
    contentTypes: ['text/*']
  },

  form: {
    limit: '56kb',
    contentTypes: [
      'application/x-www-form-urlencoded'
    ]
  },

  multipart: {
    limit: '20mb',
    maxFields: 1000,
    contentTypes: [
      'multipart/form-data'
    ]
  }
}
