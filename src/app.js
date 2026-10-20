import { fileURLToPath } from 'node:url'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import morgan from 'morgan'
import { sessionOptions } from './config/sessionOptions.js'
import { ErrorHandler } from './middlewares/ErrorHandler.js'
import { router } from './routes/router.js'

const app = express()
const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const shoppingCartFolder = fileURLToPath(new URL('.', import.meta.resolve('1dv610-laboration-2')))
const errorHandler = new ErrorHandler()

app.use(helmet())

if (process.env.NODE_ENV === 'production') {
  // The proxy in front serves HTTPS.
  // Without this, Express sees HTTP and sends no secure session cookie.
  app.set('trust proxy', 1)
}

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(express.static(publicFolder, { index: 'shop.html', extensions: ['html'] }))
app.use('/modules/shopping-cart', express.static(shoppingCartFolder))
app.use(session(sessionOptions))
app.use('/', router)

app.use((error, req, res, _next) => errorHandler.handle(error, req, res))

export { app }
