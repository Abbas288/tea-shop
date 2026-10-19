import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // The browser gets ShoppingCart from the server at this address, and the tests get it from node_modules.
      '../../modules/shopping-cart/index.js': '1dv610-laboration-2',
    },
  },
})
