import express from 'express'
import { router as discountRouter } from './discountRouter.js'
import { router as productRouter } from './productRouter.js'

export const router = express.Router()

router.use('/products', productRouter)
router.use('/discount-codes', discountRouter)
