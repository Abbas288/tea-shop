import { ApiClient } from './model/ApiClient.js'
import { BrowserStorage } from './model/BrowserStorage.js'
import { CartStorage } from './model/CartStorage.js'
import { CheckoutView } from './view/CheckoutView.js'
import { CheckoutPage } from './controller/CheckoutPage.js'

const checkoutPage = new CheckoutPage(
  new ApiClient(),
  new CartStorage(new BrowserStorage()),
  new CheckoutView(document.querySelector('main'))
)

await checkoutPage.show()
