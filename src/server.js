import { app } from './app.js'

const port = process.env.PORT || 3000

const server = app.listen(port, (error) => {
  if (error) {
    console.error('Failed to start the server:', error)
    process.exitCode = 1

    return
  }

  console.log(`Tea Shop listening on http://localhost:${server.address().port}`)
})
