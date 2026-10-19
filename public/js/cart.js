import { ApiClient } from './model/ApiClient.js'
import { CartStorage } from './model/CartStorage.js'
import { CartView } from './view/CartView.js'
import { CartPage } from './controller/CartPage.js'

const cartPage = new CartPage(new ApiClient(), new CartStorage(localStorage), new CartView(document))

await cartPage.show()
