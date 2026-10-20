import './components/tea-product-list/index.js'
import './components/tea-cart-toast/index.js'
import { apiClientInstance } from './services/apiClientInstance.js'
import { cartStorageInstance } from './services/cartStorageInstance.js'
import { ShopPage } from './pages/ShopPage.js'

const shopPage = new ShopPage(
  apiClientInstance,
  document.querySelector('tea-product-list'),
  cartStorageInstance,
  document.querySelector('tea-cart-toast')
)

await shopPage.show()
