import express from 'express'
import { AdminController } from '../controllers/AdminController.js'

export const router = express.Router()

const controller = new AdminController()

// GET admin
router.get('/', (req, res) => controller.showPanel(req, res))
