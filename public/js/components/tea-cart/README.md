# tea-cart

The cart page's teas, discount code and sums. Rows are updated in place, so focus stays where the customer is.

```html
<tea-cart></tea-cart>
```

```js
import './components/tea-cart/index.js'

const cartView = document.querySelector('tea-cart')
cartView.onRemove((productName) => console.log(productName))
cartView.show(cart)
```

| Method                         | Does                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `show(cart)`                   | Shows each tea, the sums and the discount code. An empty cart gets a message and no link to the checkout. |
| `showMessage(message)`         | Shows a message above the cart until the cart is shown again.                                             |
| `showDiscountMessage(message)` | Shows a message under the discount code field.                                                            |
| `onAdjustQuantity(handler)`    | Calls the handler with the tea and `1` or `-1` when the customer uses plus or minus.                      |
| `onChangeQuantity(handler)`    | Calls the handler with the tea and the typed number of bags, or `NaN` if it is not digits.                |
| `onRemove(handler)`            | Calls the handler with the tea when the customer removes it.                                              |
| `onApplyDiscount(handler)`     | Calls the handler with the typed code when the customer sends the discount form.                          |

The shadow root links the shop's stylesheets from `../shop.css.js`, since the page's styles do not reach into it.
