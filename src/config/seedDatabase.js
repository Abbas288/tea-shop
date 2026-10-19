import discountCodeDetails from '../data/discountCodes.json' with { type: 'json' }
import productDetails from '../data/products.json' with { type: 'json' }
import { DiscountCodeModel } from '../models/DiscountCodeModel.js'
import { ProductModel } from '../models/ProductModel.js'

/**
 * Saves the teas in products.json and the codes in discountCodes.json in the database.
 * What is already saved gets the values in the files.
 *
 * @returns {Promise<void>} Resolves when everything is saved.
 * @throws {Error} If a value in the files breaks a rule in a schema, such as a price or a percent.
 */
export const seedDatabase = async () => {
  const productReplacements = productDetails.map((details) => ({
    replaceOne: { filter: { name: details.name }, replacement: details, upsert: true },
  }))
  const discountCodeReplacements = discountCodeDetails.map((details) => ({
    replaceOne: { filter: { code: details.code }, replacement: details, upsert: true },
  }))

  await ProductModel.bulkWrite(productReplacements)
  await DiscountCodeModel.bulkWrite(discountCodeReplacements)
}
