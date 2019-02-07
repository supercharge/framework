'use strict'

const Joi = require('joi')
const User = require('../../../models/user')
const Config = require('@supercharge/framework/config')

module.exports = [{
  method: 'GET',
  path: '/login',
  options: {
    handler: async (_, h) => {
      return h.view('auth/login', null, { layout: 'clean' })
    },
    ext: {
      onPreHandler: {
        method: async (request, h) => {
          return request.auth.isAuthenticated
            ? h.redirect('/home')
            : h.continue
        }
      }
    }
  }
},

{
  method: 'POST',
  path: '/login',
  options: {
    handler: async (request, h) => {
      const { email, password } = request.payload
      const user = await User.attemptLogin({ email, password })

      request.session.set({ id: user.id })

      return h.redirect(Config.get('auth.redirects.login'))
    },
    ext: {
      onPreHandler: {
        method: async (request, h) => {
          return request.auth.isAuthenticated
            ? h.redirect('/home')
            : h.continue
        }
      },
      onPreResponse: {
        method: async (request, h) => {
          const response = request.response

          if (!response.isBoom) {
            return h.continue
          }

          return h.view('auth/login', {
            email: request.payload.email,
            errors: response.data
          }, {
            layout: 'clean'
          }).code(response.output.statusCode)
        }
      }
    },
    validate: {
      payload: {
        email: Joi.string().label('Email address').email({ minDomainAtoms: 2 }).trim().required(),
        password: Joi.string().label('Password').min(6).required()
      }
    }
  }
}]
