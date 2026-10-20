import discountCodeDetails from '../data/discountCodes.json' with { type: 'json' }
import productDetails from '../data/products.json' with { type: 'json' }
import { AdminModel } from '../models/AdminModel.js'
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

/**
 * Makes the admin in .env the shop's only admin. The password is hashed before it is saved.
 *
 * @param {string} email - Such as "admin@example.se".
 * @param {string} password - At least 10 characters.
 * @returns {Promise<void>} Resolves when the admin is saved.
 * @throws {Error} If the email address or the password breaks a rule in the schema.
 */
export const seedAdmin = async (email, password) => {
  const admin = (await AdminModel.findOne({ email })) ?? new AdminModel({ email })

  admin.password = password
  await admin.save()
  await AdminModel.deleteMany({ _id: { $ne: admin._id } })
}
