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
