'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('../../filesystem')
const Helper = require('../../helper')
const Handlebars = require('handlebars')
const Command = require('../base-command')

class MakeJob extends Command {
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
    return 'Scaffold a new queue job'
  }

  /**
   * Handle the command.
   */
  async handle ({ filename }) {
    await this.run(async () => {
      const file = filename.endsWith('.js') ? filename : `${filename}.js`

      if (await Fs.notExists(Helper.jobsPath(file))) {
        return this.createJob(file)
      }

      if (await this.confirm(`The job [${file}] already exists. Replace it?`)) {
        return this.createJob(file)
      }
    })
  }

  /**
   * Create the job file.
   *
   * @param {String} file
   */
  async createJob (file) {
    const content = await this.createJobFileContent(file)
    await this.writeFile(Helper.jobsPath(file), content)

    this.completed('created', `jobs/${file}`)
  }

  /**
   * Create the job’s class name and render it
   * into the stub.
   *
   * @param {String} file
   *
   * @returns {String}
   */
  async createJobFileContent (file) {
    const template = Handlebars.compile(
      await this.getFileContent(this.stub)
    )

    return template({ className: await this.createClassNameFrom(file) })
  }

  /**
   * Create a class name based on the job’s
   * file name. Uppercase the first letter
   * and camelCase the rest.
   *
   * @param {String} filepath
   *
   * @returns {String}
   */
  async createClassNameFrom (filepath) {
    return _.upperFirst(
      _.camelCase(await this.extractFileNameFrom(filepath))
    )
  }

  /**
   * Extract the job file’s name from the path.
   *
   * @param {String} filepath
   *
   * @returns {String}
   */
  async extractFileNameFrom (filepath) {
    return Fs.filename(filepath)
  }
}

module.exports = MakeJob
