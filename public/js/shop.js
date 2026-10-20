import './components/tea-product-list/index.js'
import './components/tea-cart-toast/index.js'
import { ApiClient } from './model/ApiClient.js'
import { BrowserStorage } from './model/BrowserStorage.js'
import { CartStorage } from './model/CartStorage.js'
import { ShopPage } from './controller/ShopPage.js'

const shopPage = new ShopPage(
  new ApiClient(),
  document.querySelector('tea-product-list'),
  new CartStorage(new BrowserStorage()),
  document.querySelector('tea-cart-toast')
)

await shopPage.show()
