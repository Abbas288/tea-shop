import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { ShopController } from './controller/ShopController.js'
import { Product } from './model/Product.js'
import { ProductCatalog } from './model/ProductCatalog.js'
import productDetails from './products.json' with { type: 'json' }
import { ShopServer } from './ShopServer.js'

const publicFolder = fileURLToPath(new URL('../public', import.meta.url))
const port = Number(env.PORT ?? 3000)

const catalog = new ProductCatalog(productDetails.map((details) => new Product(details)))
const shopServer = new ShopServer(publicFolder, new ShopController(catalog))

await shopServer.listen(port)
console.log(`The tea shop runs on http://localhost:${port}`)
