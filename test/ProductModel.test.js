import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'
import { ProductModel } from '../src/models/ProductModel.js'

const earlGrey = {
  name: 'Earl Grey',
  description: 'Black tea with bergamot.',
  price: 79,
  image: 'images/teas/earl-grey.webp',
}

describe('ProductModel', () => {
  it.each([
    ['a price that is not a number', { price: 'free' }, 'Cast to Number'],
    ['a price below 1', { price: 0 }, 'positive integer'],
    ['a price that is not an integer', { price: 79.5 }, 'positive integer'],
    ['no name', { name: undefined }, 'needs a name'],
  ])('refuses %s', async (_case, change, keyWord) => {
    const validation = new ProductModel({ ...earlGrey, ...change }).validate()

    await expect(validation).rejects.toThrow(mongoose.Error.ValidationError)
    await expect(validation).rejects.toThrow(keyWord)
  })
})
