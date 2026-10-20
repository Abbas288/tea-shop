# tea-order-tracker

The tracking page's form and the order it finds: the order number, its status, when the status last changed, and which
steps are done.

```html
<tea-order-tracker></tea-order-tracker>
```

```js
import './components/tea-order-tracker/index.js'

const orderTracker = document.querySelector('tea-order-tracker')
orderTracker.onTrack(({ number, email }) => console.log(number, email))
orderTracker.show(tracking)
```

| Method                 | Does                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `onTrack(handler)`     | Calls the handler with the order number and email address the customer sent.       |
| `show(tracking)`       | Shows the order, with a row per step: the steps that are done, then the ones left. |
| `showNoOrder(message)` | Shows the message instead of an order, and moves focus to it.                      |

Built on `../TeaElement.js`: the shadow root links the shop's stylesheets, since the page's styles do not reach into it,
and the component stays hidden until they have loaded.
