'use strict'

const Joi = require('joi')
const Boom = require('boom')
const User = require('../../models/user')
const Mailer = require('@supercharge/framework/mailer') /* eslint-disable-line */

module.exports = [{
  method: 'GET',
  path: '/forgot-password',
  options: {
    handler: async (_, h) => {
      return h.view('auth/forgot-password', null, { layout: 'clean' })
    }
  }
},

{
  method: 'POST',
  path: '/forgot-password',
  options: {
    handler: async (request, h) => {
      const { email } = request.payload
      const user = await User.findByEmailOrFail(email)

      const passwordResetToken = await user.resetPassword()
      const encodedEmail = encodeURIComponent(user.email)

      /* eslint-disable-next-line */
      const resetURL = `http://${request.headers.host}/reset-password/${encodedEmail}/${passwordResetToken}`

      try {
        /**
         * TODO: create a password reset mail and send this notification to the user
         */
        // await Mailer.send(new PasswordResetMail({ user, resetURL }))
      } catch (err) {
        throw new Boom('We have issues sending the password reset email.')
      }

      return h.view('auth/forgot-password-email-sent', null, { layout: 'clean' })
    },
    ext: {
      onPreResponse: {
        method: async (request, h) => {
          const response = request.response

          if (!response.isBoom) {
            return h.continue
          }

          return h.view('auth/forgot-password', {
            email: request.payload.email,
            errors: response.data,
            errormessage: response.message
          }, {
            layout: 'clean'
          }).code(response.output.statusCode)
        }
      }
    },
    validate: {
      payload: {
        email: Joi.string().label('Email address').email({ minDomainAtoms: 2 }).trim().required()
      }
    }
  }
}]
