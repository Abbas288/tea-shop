# tea-cart-toast

A message in the corner about the cart. It stays until the customer closes it, and focus then goes back to where it
was, also inside another component.

```html
<tea-cart-toast></tea-cart-toast>
```

```js
import './components/tea-cart-toast/index.js'

document.querySelector('tea-cart-toast').show('Earl Grey in cart: 2')
```

| Method          | Does                                          |
| --------------- | --------------------------------------------- |
| `show(message)` | Shows the message, or replaces the one shown. |

Built on `../TeaElement.js`: the shadow root links the shop's stylesheets, since the page's styles do not reach into it,
and the component stays hidden until they have loaded.
