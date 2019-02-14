'use strict'

const Joi = require('joi')
const Path = require('path')
const Fs = require('../../../../filesystem')
const Config = require('../../../../config')
const Helper = require('../../../../helper')
const BaseTest = require('../../../../testing/base-test')
const ConsoleKernel = require('../../../../foundation/console/kernel')

class ConsoleKernelTest extends BaseTest {
  async bootstrapsConsole (t) {
    this.muteConsole()

    const kernel = new ConsoleKernel()

    process.argv = ['node']
    await kernel.bootstrap()

    const { stdout, stderr } = this.consoleOutput()
    t.true(stdout.includes('Available Commands'))
    t.falsy(stderr)
  }
}

module.exports = new ConsoleKernelTest()
