import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'
import { DiscountCodeModel } from '../src/models/DiscountCodeModel.js'

describe('DiscountCodeModel', () => {
  it('keeps the code in capitals without spaces at the edges', () => {
    expect(new DiscountCodeModel({ code: ' save10 ', percent: 10 }).code).toBe('SAVE10')
  })

  it.each([
    ['a percent of 0', 0, 'from 1 to 100'],
    ['a percent of 101', 101, 'from 1 to 100'],
    ['a percent of 12.5', 12.5, 'whole percent'],
    ['a percent as text', 'ten', 'Cast to Number'],
  ])('refuses %s', async (_case, percent, keyWord) => {
    const validation = new DiscountCodeModel({ code: 'SAVE10', percent }).validate()

    await expect(validation).rejects.toThrow(mongoose.Error.ValidationError)
    await expect(validation).rejects.toThrow(keyWord)
  })
})
