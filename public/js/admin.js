import './components/tea-admin-orders/index.js'
import { apiClientInstance } from './services/apiClientInstance.js'
import { AdminPage } from './pages/AdminPage.js'

const adminPage = new AdminPage(
  apiClientInstance,
  document.querySelector('#log-out'),
  document.querySelector('tea-admin-orders')
)

await adminPage.show()
