import './components/tea-cart/index.js'
import { apiClientInstance } from './services/apiClientInstance.js'
import { cartStorageInstance } from './services/cartStorageInstance.js'
import { CartPage } from './pages/CartPage.js'

const cartPage = new CartPage(apiClientInstance, cartStorageInstance, document.querySelector('tea-cart'))

await cartPage.show()
