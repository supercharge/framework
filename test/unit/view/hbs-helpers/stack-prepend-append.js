'use strict'

const BaseTest = require('../../../../base-test')
const Encryption = require('../../../../encryption')

class StackHelperTest extends BaseTest {
  async createContentStack (t) {
    const name = Encryption.randomKey()

    const output = await this.render('{{#append name}}appended{{/append}}{{#prepend name}}prepended{{/prepend}}{{#stack name}}content{{/stack}}', { name })

    t.is(output, 'prepended\ncontent\nappended')
  }

  async throwsForStacksWithoutName (t) {
    await t.throwsAsync(async () => this.render('{{#stack}}content{{/stack}}'))
  }

  async prependsToExistingStack (t) {
    const name = Encryption.randomKey()

    const output = await this.render('{{#prepend name}}prepended{{/prepend}}{{#stack name}}content{{/stack}}', { stacks: { name }, name })

    t.is(output, 'prepended\ncontent')
  }

  async prependsToNonExistingStack (t) {
    const name = Encryption.randomKey()

    const output = await this.render('{{#prepend name}}prepended{{/prepend}}{{#stack name}}content{{/stack}}', { name })

    t.is(output, 'prepended\ncontent')
  }

  async fallbackToAnEmptyStackObject (t) {
    const name = Encryption.randomKey()

    const output = await this.render('{{#stack name}}content{{/stack}}', { name })

    t.is(output, 'content')
  }

  async throwsWhenPrependingWithoutName (t) {
    await t.throwsAsync(async () => this.render('{{#prepend}}content{{/prepend}}'))
  }

  async throwsWhenAppendingWithoutName (t) {
    await t.throwsAsync(async () => this.render('{{#append}}content{{/append}}'))
  }
}

module.exports = new StackHelperTest()
