import './components/tea-product-list/index.js'
import './components/tea-cart-toast/index.js'
import { ApiClient } from './services/ApiClient.js'
import { BrowserStorage } from './services/BrowserStorage.js'
import { CartStorage } from './services/CartStorage.js'
import { ShopPage } from './pages/ShopPage.js'

const shopPage = new ShopPage(
  new ApiClient(),
  document.querySelector('tea-product-list'),
  new CartStorage(new BrowserStorage()),
  document.querySelector('tea-cart-toast')
)

await shopPage.show()
