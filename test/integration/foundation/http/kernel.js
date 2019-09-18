'use strict'

const Joi = require('@hapi/joi')
const Path = require('path')
const Fs = require('../../../../filesystem')
const Config = require('../../../../config')
const Helper = require('../../../../helper')
const BaseTest = require('../../../../base-test')

class HttpKernelTest extends BaseTest {
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
    const request = this.addRoute({
      method: 'GET',
      path: '/kernel-test-failAction',
      options: {
        handler: () => { return 'not called' },
        validate: {
          query: Joi.object({
            name: Joi.required()
          })
        },
        ext: {
          onPreResponse: {
            method: async (request, h) => {
              t.true(Object.keys(request.response.data).includes('name'))

              return h.continue
            }
          }
        }
      }
    })

    const response = await request.get('/kernel-test-failAction')

    t.is(response.statusCode, 400)
  }
}

module.exports = new HttpKernelTest()
