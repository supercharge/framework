'use strict'

/**
 * Creates the Nodemailer transporter that
 * does nothing. It provides the required
 * method, but does not send a mail.
 */
class NullTransporter {
  sendMail () { }
}

module.exports = NullTransporter
