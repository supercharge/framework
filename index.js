'use strict'

// module.exports = require('./foundation/application')

const Path = require('path')
const Application = require('./foundation/application')

const app = new Application()
app.withAppRoot(Path.resolve(__dirname, '..', 'supercharge-app')).launchWithFullSpeed()

module.exports = Application
