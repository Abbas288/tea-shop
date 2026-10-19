import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { ErrorHandler } from './middlewares/ErrorHandler.js'
import { router } from './routes/router.js'

const app = express()
const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const errorHandler = new ErrorHandler()

app.use(helmet())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(express.static(publicFolder, { index: 'shop.html', extensions: ['html'] }))
app.use('/', router)

app.use((error, req, res, _next) => errorHandler.handle(error, req, res))

export { app }
