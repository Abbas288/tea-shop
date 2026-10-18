import { ApiClient } from './ApiClient.js'
import { ProductList } from './ProductList.js'
import { ShopPage } from './ShopPage.js'

const productList = new ProductList(document.querySelector('#products'), document.querySelector('#product-template'))
const shopPage = new ShopPage(new ApiClient(), productList)

await shopPage.show()
