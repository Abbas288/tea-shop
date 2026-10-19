import express from 'express'
import { ProductController } from '../../controllers/api/ProductController.js'

export const router = express.Router()

const controller = new ProductController()

// GET products
router.get('/', (req, res) => controller.findAll(req, res))
