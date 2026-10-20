import './components/tea-order-tracker/index.js'
import { ApiClient } from './services/ApiClient.js'
import { TrackPage } from './pages/TrackPage.js'

const trackPage = new TrackPage(new ApiClient(), document.querySelector('tea-order-tracker'))

trackPage.show()
