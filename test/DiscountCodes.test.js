import { describe, expect, it } from 'vitest'
import { DiscountCode } from '../src/models/DiscountCode.js'
import { DiscountCodes } from '../src/models/DiscountCodes.js'
import { UnknownDiscountCodeError } from '../src/models/UnknownDiscountCodeError.js'

const discountCodes = new DiscountCodes([new DiscountCode({ code: 'SAVE10', percent: 10 })])

describe('DiscountCodes', () => {
  it.each(['SAVE10', 'save10', ' Save10 '])('finds the code typed as %j', (text) => {
    expect(discountCodes.find(text).toJSON()).toEqual({ code: 'SAVE10', percent: 10 })
  })

  it.each(['SAVE20', '', 'SAVE 10'])('refuses the code %j', (text) => {
    expect(() => discountCodes.find(text)).toThrow(UnknownDiscountCodeError)
  })
})
