import { ApiClient } from './model/ApiClient.js'
import { BrowserStorage } from './model/BrowserStorage.js'
import { CartStorage } from './model/CartStorage.js'
import { CartView } from './view/CartView.js'
import { CartPage } from './controller/CartPage.js'

const cartPage = new CartPage(
  new ApiClient(),
  new CartStorage(new BrowserStorage()),
  new CartView(document.querySelector('main'))
)

await cartPage.show()
