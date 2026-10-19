import mongoose from 'mongoose'

const convertOptions = {
  versionKey: false,

  /**
   * Leaves out the database id.
   *
   * @param {object} _doc - The mongoose document.
   * @param {object} ret - The plain copy.
   * @returns {object} The copy, without _id.
   */
  transform: (_doc, ret) => {
    delete ret._id

    return ret
  },
}

// Every model adds this: timestamps, no fields the schema does not name, and copies without _id and __v.
const baseSchema = new mongoose.Schema(
  {},
  {
    strict: 'throw',
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
  }
)

export const BASE_SCHEMA = Object.freeze(baseSchema)
