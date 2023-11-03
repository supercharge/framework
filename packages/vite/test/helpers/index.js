
import Fs from '@supercharge/fs'
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/application'

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
export function makeApp () {
  const app = Application.createWithAppRoot(
    fileURLToPath(new URL('./../fixtures', import.meta.url))
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
 * @param {Application} app
 * @param {Object} content
 * @param {String} buildDirectory
 */
export async function createViteManifest (app, content, buildDirectory = 'build') {
  const manifest = content || {
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
    },
    'resources/js/hash-app.js': {
      file: 'assets/app.from-hash.version.js'
    }
  }

  const manifestPath = app.publicPath(`${buildDirectory}/manifest.json`)

  await Fs.outputJSON(manifestPath, manifest)
}

/**
 * @param {Application} app
 */
export async function clearViteManifest (app, buildDirectory = 'build') {
  const manifestPath = app.publicPath(`${buildDirectory}/manifest.json`)

  if (await Fs.exists(manifestPath)) {
    await Fs.removeFile(manifestPath)
  }
}

/**
 * @param {Application} app
 */
export async function createViteHotReloadFile (app) {
  await Fs.writeFile(app.publicPath('hot'), 'http://localhost:3000')
}

/**
 * @param {Application} app
 */
export async function clearViteHotReloadFile (app) {
  const hotReloadFilePath = app.publicPath('hot')

  if (await Fs.exists(hotReloadFilePath)) {
    await Fs.removeFile(hotReloadFilePath)
  }
}
