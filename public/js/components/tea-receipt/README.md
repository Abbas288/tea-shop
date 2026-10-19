# tea-receipt

The thank-you page's receipt: the order number and a link to track the order.

```html
<tea-receipt></tea-receipt>
```

```js
import './components/tea-receipt/index.js'

document.querySelector('tea-receipt').show()
```

| Method   | Does                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| `show()` | Reads `number` and `token` from the page address. Without both, it says there is no order to show. |

The shadow root links the shop's stylesheets from `../shop.css.js`, since the page's styles do not reach into it.
