import { ShoppingCart } from '1dv610-laboration-2'
import mongoose from 'mongoose'
import { customAlphabet } from 'nanoid'
import validator from 'validator'
import { ORDER_RULES } from '../constants/orderRules.js'
import { ORDER_STATUSES } from '../constants/orderStatuses.js'
import { BASE_SCHEMA } from './baseSchema.js'

const { isEmail } = validator

const createOrderNumber = customAlphabet(ORDER_RULES.ORDER_NUMBER_CHARACTERS, ORDER_RULES.ORDER_NUMBER_LENGTH)
const BAGS_MESSAGE = `A tea can have ${ORDER_RULES.MIN_BAGS_PER_TEA} to ${ORDER_RULES.MAX_BAGS_PER_TEA} bags.`

/**
 * Whether the order has at least one tea.
 *
 * @param {Array<{ name: string }>} lines - The lines of the order.
 * @returns {boolean} True if there is a line.
 */
const hasLines = (lines) => lines.length > 0

/**
 * Whether each tea comes once, so its bags are counted in one line.
 *
 * @param {Array<{ name: string }>} lines - The lines of the order.
 * @returns {boolean} True if no name repeats.
 */
const hasEachTeaOnce = (lines) => new Set(lines.map((line) => line.name)).size === lines.length

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter your name.'],
      trim: true,
      maxLength: [100, 'Your name can have at most 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Enter your email address.'],
      trim: true,
      maxLength: [100, 'Your email address can have at most 100 characters.'],
      validate: [isEmail, 'Enter a valid email address.'],
    },
    street: {
      type: String,
      required: [true, 'Enter your street address.'],
      trim: true,
      maxLength: [100, 'Your street address can have at most 100 characters.'],
    },
    postalCode: {
      type: String,
      required: [true, 'Enter your postal code.'],
      trim: true,
      match: [/^\d{3} ?\d{2}$/, 'A postal code has five digits, such as 352 52.'],
    },
    city: {
      type: String,
      required: [true, 'Enter your city.'],
      trim: true,
      maxLength: [100, 'Your city can have at most 100 characters.'],
    },
  },
  { _id: false, strict: 'throw' }
)

const lineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: {
      type: Number,
      required: [true, BAGS_MESSAGE],
      min: [ORDER_RULES.MIN_BAGS_PER_TEA, BAGS_MESSAGE],
      max: [ORDER_RULES.MAX_BAGS_PER_TEA, BAGS_MESSAGE],
      validate: [Number.isInteger, BAGS_MESSAGE],
    },
  },
  { _id: false, strict: 'throw' }
)

const schema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    // Also applied to lookups. A search for " k7q2m9xd" finds K7Q2M9XD.
    trim: true,
    uppercase: true,
    unique: true,
    /**
     * Random, not counted up, and cannot be guessed from other orders.
     *
     * @returns {string} Such as "K7Q2M9XD".
     */
    default: () => createOrderNumber(),
  },
  customer: { type: customerSchema, required: [true, 'Enter your delivery details.'] },
  lines: {
    type: [lineSchema],
    validate: [
      { validator: hasLines, message: 'The cart is empty.' },
      { validator: hasEachTeaOnce, message: 'The cart has a tea twice.' },
    ],
  },
  subtotal: { type: Number, required: true },
  discountCode: { type: String, default: '' },
  discountPercent: { type: Number, default: 0 },
  discount: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: Object.values(ORDER_STATUSES),
    default: ORDER_STATUSES.RECEIVED,
  },
  statusChangedAt: { type: Date, required: true, default: Date.now },
})

schema.add(BASE_SCHEMA)

// Prices the order with the ShoppingCart package before it is checked and saved.
// The total is rounded to whole kronor, as in the browser.
schema.pre('validate', function () {
  const shoppingCart = new ShoppingCart()

  for (const line of this.lines) {
    shoppingCart.addItem(line.name, line.price, line.quantity)
  }

  shoppingCart.applyDiscount(this.discountPercent)
  this.subtotal = shoppingCart.getSubtotal()
  this.total = Math.round(shoppingCart.getTotalPrice())
  this.discount = this.subtotal - this.total
})

export const OrderModel = mongoose.model('Order', schema)
