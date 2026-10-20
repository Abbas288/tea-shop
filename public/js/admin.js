import { apiClientInstance } from './services/apiClientInstance.js'
import { AdminPage } from './pages/AdminPage.js'

const adminPage = new AdminPage(apiClientInstance, document.querySelector('#log-out'))

adminPage.show()
