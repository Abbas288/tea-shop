import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { ShopServer } from './ShopServer.js'

const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const port = Number(env.PORT ?? 3000)
const shopServer = new ShopServer(publicFolder)

await shopServer.listen(port)
console.log(`The tea shop runs on http://localhost:${port}`)
