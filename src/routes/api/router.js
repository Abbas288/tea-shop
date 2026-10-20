import express from 'express'
import { router as adminOrderRouter } from './adminOrderRouter.js'
import { router as adminRouter } from './adminRouter.js'
import { router as discountRouter } from './discountRouter.js'
import { router as orderRouter } from './orderRouter.js'
import { router as productRouter } from './productRouter.js'

export const router = express.Router()

router.use('/products', productRouter)
router.use('/discount-codes', discountRouter)
router.use('/orders', orderRouter)
router.use('/admin/orders', adminOrderRouter)
router.use('/admin', adminRouter)
