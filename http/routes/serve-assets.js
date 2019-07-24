'use strict'

const ms = require('ms')
const Config = require('../../config')
const { expiresIn, ...config } = Config.get('assets.cache', {})

const cacheConfig = {
  expiresIn: typeof expiresIn === 'number' ? ms(expiresIn) : null,
  ...config
}

module.exports = [
  {
    method: 'GET',
    path: '/js/{path*}',
    options: {
      cache: cacheConfig,
      handler: { directory: { path: 'public/js' } }
    }
  },
  {
    method: 'GET',
    path: '/css/{path*}',
    options: {
      cache: cacheConfig,
      handler: { directory: { path: 'public/css' } }
    }
  },
  {
    method: 'GET',
    path: '/images/{path*}',
    options: {
      cache: cacheConfig,
      handler: { directory: { path: 'public/images' } }
    }
  },
  {
    method: 'GET',
    path: '/fonts/{path*}',
    options: {
      cache: cacheConfig,
      handler: { directory: { path: 'public/fonts' } }
    }
  },
  {
    method: 'GET',
    path: '/favicon.ico',
    handler: { file: { path: 'public/favicon.ico' } }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    handler: { file: { path: 'robots.txt' } }
  }
]
