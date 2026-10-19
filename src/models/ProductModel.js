import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product needs a name.'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'A product needs a description.'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A product needs a price.'],
    min: [1, 'A price must be a positive integer.'],
    validate: [Number.isInteger, 'A price must be a positive integer.'],
  },
  image: {
    type: String,
    required: [true, 'A product needs an image.'],
    trim: true,
  },
})

schema.add(BASE_SCHEMA)

export const ProductModel = mongoose.model('Product', schema)
