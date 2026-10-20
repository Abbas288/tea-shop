# tea-checkout

The checkout page's delivery form, the order with its sums and the button that places it.

```html
<tea-checkout></tea-checkout>
```

```js
import './components/tea-checkout/index.js'

const checkoutView = document.querySelector('tea-checkout')
checkoutView.onPlaceOrder((customer) => console.log(customer.name))
checkoutView.showOrder(cart)
```

| Method                           | Does                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `showOrder(cart)`                | Shows each tea, the sums and the discount code, and enables the button.                |
| `showCannotOrder(message)`       | Shows why there is nothing to order. The button stays disabled.                        |
| `showPlacingOrder()`             | Disables the button while the order is sent.                                           |
| `showOrderRefused(message)`      | Shows why the order was not placed, enables the button and moves focus to the message. |
| `goToReceipt({ number, token })` | Opens the thank-you page.                                                              |
| `onPlaceOrder(handler)`          | Calls the handler with the form's values when the customer sends a valid form.         |

Built on `../TeaElement.js`: the shadow root links the shop's stylesheets, since the page's styles do not reach into it,
and the component stays hidden until they have loaded.
