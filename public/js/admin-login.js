import './components/tea-admin-login/index.js'
import { apiClientInstance } from './services/apiClientInstance.js'
import { AdminLoginPage } from './pages/AdminLoginPage.js'

const adminLoginPage = new AdminLoginPage(apiClientInstance, document.querySelector('tea-admin-login'))

adminLoginPage.show()
