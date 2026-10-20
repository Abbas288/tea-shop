import express from 'express'
import { OrderController } from '../../controllers/OrderController.js'
import { AdminGuard } from '../../middlewares/AdminGuard.js'

export const router = express.Router()

const guard = new AdminGuard()
const controller = new OrderController()

// Every route below needs a logged-in admin.
// This middleware runs before the order is looked up.
router.use((req, res, next) => guard.requireLogin(req, res, next))

// Provide req.doc to the route if :number is present.
router.param('number', (req, res, next, number) => controller.loadOrderDocument(req, res, next, number))

// GET admin/orders
router.get('/', (req, res) => controller.findAll(req, res))

// GET admin/orders/:number
router.get('/:number', (req, res) => controller.find(req, res))

// POST admin/orders/:number/events
router.post('/:number/events', (req, res) => controller.changeStatus(req, res))
