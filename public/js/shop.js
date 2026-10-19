import { ApiClient } from './model/ApiClient.js'
import { CartStorage } from './model/CartStorage.js'
import { CartToast } from './view/CartToast.js'
import { ProductList } from './view/ProductList.js'
import { ShopPage } from './controller/ShopPage.js'

const productList = new ProductList(document.querySelector('#products'), document.querySelector('#product-template'))
const cartToast = new CartToast(document.querySelector('#cart-toast'))
const shopPage = new ShopPage(new ApiClient(), productList, new CartStorage(localStorage), cartToast)

await shopPage.show()
