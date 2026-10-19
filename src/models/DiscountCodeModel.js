import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'A discount needs a code.'],
    trim: true,
    uppercase: true,
    unique: true,
  },
  percent: {
    type: Number,
    required: [true, 'A discount needs a percent.'],
    min: [1, 'A discount must be from 1 to 100 percent.'],
    max: [100, 'A discount must be from 1 to 100 percent.'],
    validate: [Number.isInteger, 'A discount must be a whole percent.'],
  },
})

schema.add(BASE_SCHEMA)

export const DiscountCodeModel = mongoose.model('DiscountCode', schema)
