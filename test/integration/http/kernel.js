'use strict'

const Joi = require('joi')
const Path = require('path')
const Fs = require('../../../filesystem')
const Config = require('../../../config')
const Helper = require('../../../helper')
const BaseTest = require('../../../testing/base-test')
const HttpKernel = require('../../../foundation/http/kernel')
const Application = require('../../../foundation/application')

class BaseRoutesTest extends BaseTest {
  constructor () {
    super()
    this.appRoot = Path.resolve(__dirname, 'fixtures')
  }

  async before () {
    Config.set('app.key', 'a'.repeat(32))

    this.helperStub = this.stub(Helper, 'resourcePath').returns(
      Path.resolve(this.appRoot, 'resources', 'views')
    )

    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/helpers'))
    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/layouts'))
    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/partials'))
  }

  async alwaysAfter () {
    this.helperStub.restore()

    await Fs.remove(
      Path.resolve(this.appRoot, 'resources')
    )
  }

  async serialThrowsWithCustomFailAction (t) {
    const response = await this.addRoute({
      method: 'GET',
      path: '/kernel-test-failAction',
      options: {
        handler: () => { return 'validation error' },
        validate: { query: { name: Joi.required() } }
        // ext: {
        //   onPreResponse: {
        //     method: async (request, h) => {
        //       return request.response.data
        //     }
        //   }
        // }
      }
    }).get('/kernel-test-failAction')

    t.is(response.statusCode, 400)

    console.log(response.result)
  }
}

module.exports = new BaseRoutesTest()
