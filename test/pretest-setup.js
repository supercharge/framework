'use strict'

const Path = require('path')
const Config = require('../config')
const Helper = require('../helper')

Helper.setAppRoot(
  Path.resolve(__dirname, '..')
)

Config.set('logging.driver', 'file')
Config.set('logging.channels.file', { path: './test/temp/app.testing.log' })
