'use strict'

const Fs = require('@supercharge/fs')
const Path = require('path')
const { Application } = require('@supercharge/application')

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
function makeApp () {
  const app = Application.createWithAppRoot(
    Path.resolve(__dirname, '../fixtures')
  )

  app.config().set('view', {
    driver: 'handlebars',
    handlebars: {
      views: app.resourcePath('views'),
      partials: app.resourcePath('views/partials'),
      helpers: app.resourcePath('views/helpers')
      // layouts: app.resourcePath('views/layouts')
      // defaultLayout: 'app'
    }
  })

  return app
}

/**
 *
 * @param {Application} app
 * @param {Object} content
 * @param {String} buildDirectory
 */
async function createViteManifest (app, content, buildDirectory = 'build') {
  const manifest = JSON.stringify(content || {
    'resources/js/app.js': {
      file: 'assets/app.version.js'
    },
    'resources/js/app-with-css-import.js': {
      file: 'assets/app-with-css-import.version.js',
      css: [
        'assets/imported-css.version.css'
      ]
    },
    'resources/css/imported-css.css': {
      file: 'assets/imported-css.version.css'
    },
    'resources/js/app-with-shared-css.js': {
      file: 'assets/app-with-shared-css.version.js',
      imports: [
        '_someFile.js'
      ]
    },
    'resources/css/app.css': {
      file: 'assets/app.version.css'
    },
    '_someFile.js': {
      css: [
        'assets/shared-css.version.css'
      ]
    },
    'resources/css/shared-css': {
      file: 'assets/shared-css.version.css'
    }
  })

  const manifestPath = app.publicPath(`${buildDirectory}/manifest.json`)

  await Fs.writeFile(manifestPath, manifest)
}

/**
 *
 * @param {Application} app
 */
async function clearViteManifest (app, buildDirectory = 'build') {
  const manifestPath = app.publicPath(`${buildDirectory}/manifest.json`)

  if (await Fs.exists(manifestPath)) {
    await Fs.removeFile(manifestPath)
  }
}

/**
 *
 * @param {Application} app
 */
async function createViteHotReloadFile (app) {
  await Fs.writeFile(app.publicPath('hot'), 'http://localhost:3000')
}

/**
 *
 * @param {Application} app
 */
async function clearViteHotReloadFile (app) {
  const hotReloadFilePath = app.publicPath('hot')

  if (await Fs.exists(hotReloadFilePath)) {
    await Fs.removeFile(hotReloadFilePath)
  }
}

module.exports = {
  makeApp,
  clearViteManifest,
  createViteManifest,
  clearViteHotReloadFile,
  createViteHotReloadFile
}
