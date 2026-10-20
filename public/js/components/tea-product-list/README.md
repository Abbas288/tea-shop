# tea-product-list

The shop's teas, one product card per tea. Picking a card adds the tea to the cart.

```html
<tea-product-list></tea-product-list>
```

```js
import './components/tea-product-list/index.js'

const productList = document.querySelector('tea-product-list')
productList.onAddToCart((productName) => console.log(productName))
productList.show(products)
```

| Method                 | Does                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `show(products)`       | Shows a card with the image, name, description and price of each tea. |
| `showError(message)`   | Replaces the teas with a message.                                     |
| `onAddToCart(handler)` | Calls the handler with the tea's name when the customer picks a card. |

Built on `../TeaElement.js`: the shadow root links the shop's stylesheets, since the page's styles do not reach into it,
and the component stays hidden until they have loaded. Furni's product section is inside the component, because its
styles for the cards only apply inside `.product-section`.
