# tea-admin-orders

The admin's list of orders, and the open order with the customer, the teas and a button for each status change.

```html
<tea-admin-orders></tea-admin-orders>
```

```js
import './components/tea-admin-orders/index.js'

const orderAdmin = document.querySelector('tea-admin-orders')
orderAdmin.onOpen((number) => console.log(number))
orderAdmin.onStatusChange((number, eventName) => console.log(number, eventName))
orderAdmin.onUndo((number) => console.log(number))
orderAdmin.showOrders(orders)
```

| Method                    | Does                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| `showOrders(orders)`      | Shows a row with an Open button for each order.                                   |
| `showOrder(order)`        | Shows the order, with a button for each event it can take now and an undo button. |
| `showMessage(message)`    | Shows the message above the list and moves focus to it.                           |
| `onOpen(handler)`         | Calls the handler with the order number when the admin opens an order.            |
| `onStatusChange(handler)` | Calls the handler with the order number and the event, such as `"pack"`.          |
| `onUndo(handler)`         | Calls the handler with the order number when the admin undoes the latest change.  |

Every value is shown with `textContent`, so a customer's name or address is never read as HTML.

Built on `../TeaElement.js`, with its own stylesheets: Bootstrap and the admin page's `css/admin.css`. The component
stays hidden until they have loaded.
