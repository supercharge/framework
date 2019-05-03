'use strict'

const Path = require('path')
const Helper = require('../../../helper')

class LoadRoutes {
  constructor () {
    this._assetsFolder = 'public'
    this.expiresIn = 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  async extends (server) {
    await this.serveAssets(server)
  }

  async serveAssets (server) {
    server.route([
      {
        method: 'GET',
        path: '/js/{path*}',
        config: {
          handler: { directory: { path: this.resolveAsset('js') } },
          cache: {
            expiresIn: this.expiresIn,
            privacy: 'private'
          }
        }
      },
      {
        method: 'GET',
        path: '/css/{path*}',
        config: {
          handler: { directory: { path: this.resolveAsset('css') } },
          cache: {
            expiresIn: this.expiresIn,
            privacy: 'private'
          }
        }
      },
      {
        method: 'GET',
        path: '/images/{path*}',
        config: {
          handler: { directory: { path: this.resolveAsset('images') } },
          cache: {
            expiresIn: this.expiresIn,
            privacy: 'private'
          }
        }
      },
      {
        method: 'GET',
        path: '/favicon.ico',
        handler: { file: { path: this.resolveAsset('favicon.ico') } }
      }
    ])
  }

  resolveAsset (file) {
    return Path.resolve(this.assetsFolder(), file)
  }

  assetsFolder () {
    return Path.resolve(Helper.appRoot(), this._assetsFolder)
  }
}

module.exports = LoadRoutes
