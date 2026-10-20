import { BrowserStorage } from './BrowserStorage.js'
import { CartStorage } from './CartStorage.js'

// The CartStorage each start file gives its page.
export const cartStorageInstance = new CartStorage(new BrowserStorage())
