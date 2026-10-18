import { ApiClient } from './model/ApiClient.js'
import { ProductList } from './view/ProductList.js'
import { ShopPage } from './controller/ShopPage.js'

const productList = new ProductList(document.querySelector('#products'), document.querySelector('#product-template'))
const shopPage = new ShopPage(new ApiClient(), productList)

await shopPage.show()
