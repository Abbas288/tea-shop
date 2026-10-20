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

Built on `../TeaElement.js`: the shadow root links the shop's stylesheets, since the page's styles do not reach into it,
and the component stays hidden until they have loaded.
