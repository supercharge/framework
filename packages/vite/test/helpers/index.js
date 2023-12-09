
/**
 * @typedef {import('@supercharge/contracts').ViteConfig} ViteConfigContract
 */

import Path from 'node:path'
import Fs from '@supercharge/fs'
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/application'
import { ViteConfig, HotReloadFile } from '../../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = Path.resolve(__dirname, '../fixtures')

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
export function makeApp () {
  const app = Application.createWithAppRoot(fixturesPath)

  app.config()
    .set('view', {
      driver: 'handlebars',
      handlebars: {
        views: app.resourcePath('views'),
        partials: app.resourcePath('views/partials'),
        helpers: app.resourcePath('views/helpers')
      // layouts: app.resourcePath('views/layouts')
      // defaultLayout: 'app'
      }
    })
    .set('vite', {
      assetsUrl: '/build',
      hotReloadFilePath: app.publicPath('build/.vite/hot.json'),
      manifestFilePath: app.publicPath('build/.vite/manifest.json')
    })

  return app
}

/**
 * @param {ViteConfig} viteConfig
 * @param {Object} content
 */
export async function createViteManifest (viteConfig, content) {
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

  if (!viteConfig) {
    viteConfig = createViteConfig()
  }

  const manifestPath = viteConfig.manifestFilePath()

  await Fs.outputJSON(manifestPath, manifest)
}

/**
 * @param {Application} app
 */
export async function clearViteManifest () {
  const viteConfig = createViteConfig()
  const manifestPath = viteConfig.manifestFilePath()

  if (await Fs.exists(manifestPath)) {
    await Fs.removeFile(manifestPath)
  }
}

/**
 * @param {ViteConfigContract} viteConfig
 */
export function createViteConfig (viteConfig) {
  const app = makeApp()
  const defaultViteConfig = app.config().get('vite')

  if (typeof viteConfig === 'object') {
    return ViteConfig.from({
      ...defaultViteConfig,
      ...viteConfig
    })
  }

  return ViteConfig.from(defaultViteConfig)
}

/**
 * @param {ViteConfig} viteConfig
 */
export function createViteHotReloadFile (viteConfig) {
  if (!viteConfig) {
    viteConfig = createViteConfig()
  }

  HotReloadFile
    .from(viteConfig.hotReloadFilePath())
    .writeFileSync({
      viteDevServerUrl: 'http://localhost:3000'
    })
}

/**
 * @param {ViteConfig} viteConfig
 */
export function clearViteHotReloadFile (viteConfig) {
  if (!viteConfig) {
    viteConfig = createViteConfig()
  }

  HotReloadFile
    .from(viteConfig.hotReloadFilePath())
    .deleteHotfile()
}
