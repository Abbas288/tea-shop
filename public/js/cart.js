import './components/tea-cart/index.js'
import { ApiClient } from './services/ApiClient.js'
import { BrowserStorage } from './services/BrowserStorage.js'
import { CartStorage } from './services/CartStorage.js'
import { CartPage } from './pages/CartPage.js'

const cartPage = new CartPage(
  new ApiClient(),
  new CartStorage(new BrowserStorage()),
  document.querySelector('tea-cart')
)

await cartPage.show()
