'use strict'

const Path = require('path')
const { Helper, Config } = require('..')

Helper.setAppRoot(
  Path.resolve(__dirname, '..')
)

Config.set('logging.driver', 'file')
Config.set('logging.channels.file', { path: './test/temp/app.testing.log' })
