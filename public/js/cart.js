import './components/tea-cart/index.js'
import { ApiClient } from './model/ApiClient.js'
import { BrowserStorage } from './model/BrowserStorage.js'
import { CartStorage } from './model/CartStorage.js'
import { CartPage } from './controller/CartPage.js'

const cartPage = new CartPage(
  new ApiClient(),
  new CartStorage(new BrowserStorage()),
  document.querySelector('tea-cart')
)

await cartPage.show()
