'use strict'

const Joi = require('@hapi/joi')
const User = require('../../models/user')
const Config = require('@supercharge/framework/config')

module.exports = [{
  method: 'GET',
  path: '/reset-password/{email}/{resetToken}',
  options: {
    handler: async (_, h) => {
      return h.view('auth/reset-password', null, { layout: 'clean' })
    },
    ext: {
      onPreResponse: {
        method: async (request, h) => {
          const response = request.response

          if (!response.isBoom) {
            return h.continue
          }

          return h
            .view('auth/reset-password', { errors: response.data }, { layout: 'clean' })
            .code(response.output.statusCode)
        }
      }
    },
    validate: {
      params: {
        email: Joi.string().email({ minDomainSegments: 2 }).label('Email address').trim().required(),
        resetToken: Joi.string().label('Password reset token').trim().required()
      }
    }
  }
},

{
  method: 'POST',
  path: '/reset-password/{email}/{resetToken}',
  options: {
    handler: async (request, h) => {
      const email = decodeURIComponent(request.params.email)
      let user = await User.findByEmailOrFail(email)

      user = await user.comparePasswordResetToken(request.params.resetToken)
      user.passwordResetToken = undefined
      user.passwordResetDeadline = undefined
      user.password = request.payload.password

      await user.hashPassword()

      request.session.set({ userId: user.id })

      return h.redirect(Config.get('auth.redirects.passwordReset'))
    },
    ext: {
      onPreResponse: {
        method: async (request, h) => {
          const response = request.response

          if (!response.isBoom) {
            return h.continue
          }

          return h
            .view('auth/reset-password', { errors: response.data }, { layout: 'clean' })
            .code(response.output.statusCode)
        }
      }
    },
    validate: {
      params: {
        email: Joi.string().label('Email address').email({ minDomainSegments: 2 }).trim().required(),
        resetToken: Joi.string().label('Password reset token').trim().required()
      },
      payload: {
        password: Joi.string().label('Password').min(6).required(),
        passwordConfirm: Joi.string().label('Confirm password').min(6)
          .valid(Joi.ref('password'))
          .options({
            language: {
              any: { allowOnly: 'must match your new password' }
            }
          })
          .required()
      }
    }
  }
}]
