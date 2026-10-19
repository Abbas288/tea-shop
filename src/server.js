import mongoose from 'mongoose'
import { app } from './app.js'
import { connectToDatabase } from './config/mongoose.js'
import { seedDatabase } from './config/seedDatabase.js'

const port = process.env.PORT || 3000

try {
  await connectToDatabase(process.env.DB_CONNECTION_STRING)
  await seedDatabase()

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
  console.error('Failed to set up the database:', error)
  process.exitCode = 1

  // An open connection would keep the process running.
  await mongoose.disconnect()
}
