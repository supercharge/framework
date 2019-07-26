'use strict'

const Boom = require('@hapi/boom')
const Hash = require('@supercharge/framework/hashing')
const Encryption = require('@supercharge/framework/encryption')
const { Mongoose } = require('@supercharge/framework/database')

class User {
  get gravatar () {
    const hash = Hash.md5(this.email)

    return `https://gravatar.com/avatar/${hash}?s=200`
  }

  static async findByEmail (email) {
    return this.findOne({ email })
  }

  static async findByEmailOrFail (email) {
    return this
      .findOne({ email })
      .orFail(Boom.notFound(null, { email: 'Email address is not registered' }))
  }

  static async attemptLogin ({ email, password }) {
    const user = await this.findByEmailOrFail(email)

    return user.comparePassword(password)
  }

  static async createFrom ({ email, password }) {
    if (await this.findByEmail(email)) {
      const message = 'Email address is already registered'
      throw Boom.conflict(message, { email: message })
    }

    const user = new this({ email, password })

    return user.hashPassword()
  }

  async comparePassword (candidatePassword) {
    const isMatch = await Hash.check(candidatePassword, this.password)

    if (isMatch) {
      return this
    }

    const message = 'The entered password is incorrect'
    throw Boom.badRequest(message, { password: message })
  }

  async hashPassword () {
    this.password = await Hash.make(this.password)

    return this.save()
  }

  async resetPassword () {
    const passwordResetToken = Encryption.randomKey(20)
    const hash = await Hash.make(passwordResetToken)

    this.passwordResetToken = hash
    this.passwordResetDeadline = Date.now() + 1000 * 60 * 60 // 1 hour

    await this.save()

    return passwordResetToken
  }

  async comparePasswordResetToken (resetToken) {
    const message = 'Your password reset token is invalid, please request a new one.'

    if (this.passwordResetDeadline < Date.now()) {
      throw Boom.badRequest(message)
    }

    const isMatch = await Hash.check(resetToken, this.passwordResetToken)

    if (isMatch) {
      return this
    }

    throw Boom.badRequest(message, { resetToken: message })
  }
}

const schema = new Mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  password: String,
  name: String,
  passwordResetToken: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // this ensures the unique index applies to "not null" values only
  },
  passwordResetDeadline: Date,
  scope: { type: [String], default: ['user'] }
},
{
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
      delete ret.password

      return ret
    }
  }
})

schema.loadClass(User)

module.exports = Mongoose.model('User', schema)
