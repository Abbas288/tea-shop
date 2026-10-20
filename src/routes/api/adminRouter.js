import express from 'express'
import { AdminController } from '../../controllers/AdminController.js'

export const router = express.Router()

const controller = new AdminController()

// POST admin/login
router.post('/login', (req, res) => controller.login(req, res))

// POST admin/logout
router.post('/logout', (req, res) => controller.logout(req, res))
