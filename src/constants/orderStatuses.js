/**
 * The steps of an order.
 * Received to delivered come in this order, and cancelled can follow received or packed.
 */
export const ORDER_STATUSES = Object.freeze({
  RECEIVED: 'received',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
})

/**
 * The events that move an order from one step to the next.
 */
export const ORDER_EVENTS = Object.freeze({
  PACK: 'pack',
  SHIP: 'ship',
  DELIVER: 'deliver',
  CANCEL: 'cancel',
})
