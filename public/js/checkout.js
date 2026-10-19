import './components/tea-checkout/index.js'
import { ApiClient } from './model/ApiClient.js'
import { BrowserStorage } from './model/BrowserStorage.js'
import { CartStorage } from './model/CartStorage.js'
import { CheckoutPage } from './controller/CheckoutPage.js'

const checkoutPage = new CheckoutPage(
  new ApiClient(),
  new CartStorage(new BrowserStorage()),
  document.querySelector('tea-checkout')
)

await checkoutPage.show()
