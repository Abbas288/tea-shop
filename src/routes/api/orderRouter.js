import express from 'express'
import { OrderController } from '../../controllers/OrderController.js'

export const router = express.Router()

const controller = new OrderController()

// Provide req.doc to the route if :number is present.
router.param('number', (req, res, next, number) => controller.loadOrderDocument(req, res, next, number))

// POST orders
router.post('/', (req, res) => controller.create(req, res))

// POST orders/:number/tracking (the customer's email address in the body)
router.post('/:number/tracking', (req, res) => controller.track(req, res))
