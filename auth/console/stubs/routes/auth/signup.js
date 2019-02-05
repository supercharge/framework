'use strict'

const Joi = require('joi')
const User = require('../../../models/user')
const Event = require('@supercharge/framework/event')
const Config = require('@supercharge/framework/config')
const UserRegisteredEvent = require('../../../events/user-registered')

module.exports = {
  method: ['GET', 'POST'],
  path: '/signup',
  options: {
    handler: async (request, h) => {
      if (request.method === 'get') {
        return h.view('auth/signup', null, { layout: 'clean' })
      }

      const { email, password } = request.payload
      const user = await User.createFrom({ email, password })

      request.cookieAuth.set({ id: user.id })

      Event.fire(new UserRegisteredEvent(user))

      return h.redirect(Config.get('auth.redirects.signup'))
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
        method: async function (request, h) {
          const response = request.response

          if (!response.isBoom) {
            return h.continue
          }

          return h.view('auth/signup', {
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
}
