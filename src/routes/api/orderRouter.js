import express from 'express'
import { OrderController } from '../../controllers/OrderController.js'

export const router = express.Router()

const controller = new OrderController()

// POST orders
router.post('/', (req, res) => controller.create(req, res))
