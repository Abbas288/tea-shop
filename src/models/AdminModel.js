import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'
import { BASE_SCHEMA } from './baseSchema.js'

const { isEmail } = validator

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'An admin needs an email address.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'An admin needs a valid email address.'],
  },
  password: {
    type: String,
    required: [true, 'An admin needs a password.'],
    minLength: [10, 'An admin password needs at least 10 characters.'],
    // bcrypt reads at most 72 bytes.
    maxLength: [72, 'An admin password can have at most 72 characters.'],
  },
})

schema.add(BASE_SCHEMA)

// Hashes a new password before it is saved, so the database never has it in plain text.
schema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
})

/**
 * Finds the admin with the email address and checks the password. Only text is looked up, so an object such as
 * { $ne: null } cannot match an admin.
 *
 * @param {*} email - What the browser sent.
 * @param {*} password - What the browser sent.
 * @returns {Promise<mongoose.Document>} The admin.
 * @throws {Error} If no admin has this email address and password.
 */
schema.statics.authenticate = async function (email, password) {
  const admin = typeof email === 'string' ? await this.findOne({ email }) : null

  if (!admin || typeof password !== 'string' || !(await bcrypt.compare(password, admin.password))) {
    throw new Error('Wrong email address or password.')
  }

  return admin
}

export const AdminModel = mongoose.model('Admin', schema)
