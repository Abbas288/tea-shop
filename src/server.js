import mongoose from 'mongoose'
import { app } from './app.js'
import { connectToDatabase } from './config/mongoose.js'
import { seedAdmin, seedDatabase } from './config/seedDatabase.js'

const port = process.env.PORT || 3000
const REQUIRED_SETTINGS = ['DB_CONNECTION_STRING', 'SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']

try {
  const missingSettings = REQUIRED_SETTINGS.filter((name) => !process.env[name])

  if (missingSettings.length > 0) {
    throw new Error(`Set ${missingSettings.join(', ')} in .env.`)
  }

  await connectToDatabase(process.env.DB_CONNECTION_STRING)
  await seedDatabase()
  await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)

  const server = app.listen(port, (error) => {
    if (error) {
      console.error('Failed to start the server:', error)
      process.exitCode = 1
      mongoose.disconnect()

      return
    }

    console.log(`Tea Shop listening on http://localhost:${server.address().port}`)
  })
} catch (error) {
  console.error('Failed to set up the server:', error)
  process.exitCode = 1

  // An open connection would keep the process running.
  await mongoose.disconnect()
}
