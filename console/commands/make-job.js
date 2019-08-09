'use strict'

const _ = require('lodash')
const Path = require('path')
const Helper = require('../../helper')
const Handlebars = require('handlebars')
const BaseCommand = require('./base-command')

class MakeJob extends BaseCommand {
  constructor () {
    super()

    this.stub = Path.resolve(__dirname, '..', 'stubs/make/job/job.stub')
  }

  /**
   * Returns the command signature.
   */
  static get signature () {
    return `
      make:job
        { filename: Name of your job file (can include a path, like auth/login.js) }
    `
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Scaffold a new job'
  }

  /**
   * Handle the command.
   */
  async handle ({ filename }) {
    await this.run(async () => {
      const file = filename.endsWith('.js')
        ? filename
        : `${filename}.js`

      if (await this.pathExists(Helper.jobsPath(file))) {
        if (!await this.confirm(`The job [${file}] exists already. Replace it?`)) {
          return
        }
      }

      await this.createJob(file)
    })
  }

  async createJob (file) {
    const content = await this.createJobFileContent(file)
    await this.writeFile(Helper.jobsPath(file), content)

    this.completed('created', `jobs/${file}`)
  }

  async createJobFileContent (file) {
    const stubContent = await this.getFileContent(this.stub)
    const template = Handlebars.compile(stubContent)

    return template({ className: this.createClassNameFrom(file) })
  }

  createClassNameFrom (filepath) {
    return _.upperFirst(
      _.camelCase(this.extractFileNameFrom(filepath))
    )
  }

  extractFileNameFrom (filepath) {
    const { name } = Path.parse(filepath)

    return name
  }
}

module.exports = MakeJob
