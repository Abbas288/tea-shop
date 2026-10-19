import express from 'express'
import createError from 'http-errors'
import { router as apiRouter } from './api/router.js'

export const router = express.Router()

router.use('/api', apiRouter)

// Catch 404 (always the last route).
router.use((_req, _res, next) => {
  next(createError(404))
})
