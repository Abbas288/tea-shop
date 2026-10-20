import './components/tea-checkout/index.js'
import { ApiClient } from './services/ApiClient.js'
import { BrowserStorage } from './services/BrowserStorage.js'
import { CartStorage } from './services/CartStorage.js'
import { CheckoutPage } from './pages/CheckoutPage.js'

const checkoutPage = new CheckoutPage(
  new ApiClient(),
  new CartStorage(new BrowserStorage()),
  document.querySelector('tea-checkout')
)

await checkoutPage.show()
