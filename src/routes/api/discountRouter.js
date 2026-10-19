import express from 'express'
import { DiscountController } from '../../controllers/api/DiscountController.js'

export const router = express.Router()

const controller = new DiscountController()

// GET discount-codes/:code
router.get('/:code', (req, res) => controller.find(req, res))
