import express from 'express'
import { router as productRouter } from './productRouter.js'

export const router = express.Router()

router.use('/products', productRouter)
