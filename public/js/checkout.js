import './components/tea-checkout/index.js'
import { apiClientInstance } from './services/apiClientInstance.js'
import { cartStorageInstance } from './services/cartStorageInstance.js'
import { CheckoutPage } from './pages/CheckoutPage.js'

const checkoutPage = new CheckoutPage(apiClientInstance, cartStorageInstance, document.querySelector('tea-checkout'))

await checkoutPage.show()
