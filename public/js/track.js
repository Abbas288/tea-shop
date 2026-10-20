import './components/tea-order-tracker/index.js'
import { apiClientInstance } from './services/apiClientInstance.js'
import { TrackPage } from './pages/TrackPage.js'

const trackPage = new TrackPage(apiClientInstance, document.querySelector('tea-order-tracker'))

trackPage.show()
