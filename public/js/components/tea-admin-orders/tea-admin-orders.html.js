/**
 * The list of orders and the open order, with templates for the rows.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2">Orders</h1>
  </div>
  <p id="orders-message" role="status" tabindex="-1">Loading the orders...</p>

  <div class="table-responsive">
    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Placed</th>
          <th scope="col">Status</th>
          <th scope="col">Total</th>
          <th scope="col"><span class="visually-hidden">Open</span></th>
        </tr>
      </thead>
      <tbody id="orders"></tbody>
    </table>
  </div>

  <section id="open-order" hidden>
    <h2 class="h4 mt-4">Order <span id="order-number"></span></h2>
    <p>
      Status: <strong id="order-status"></strong>
      <span class="text-muted small">since <span id="status-changed"></span></span>
    </p>
    <div class="btn-toolbar gap-2 mb-4" id="status-buttons"></div>

    <h3 class="h6">Customer</h3>
    <p class="mb-4">
      <span id="customer-name"></span><br />
      <span id="customer-email"></span><br />
      <span id="customer-street"></span><br />
      <span id="customer-city"></span>
    </p>

    <h3 class="h6">Teas</h3>
    <table class="table table-sm mb-5">
      <thead>
        <tr>
          <th scope="col">Tea</th>
          <th scope="col">Bags</th>
          <th scope="col">Price per bag</th>
        </tr>
      </thead>
      <tbody id="order-lines"></tbody>
      <tfoot>
        <tr>
          <th scope="row" colspan="2">Subtotal</th>
          <td id="order-subtotal"></td>
        </tr>
        <tr>
          <th scope="row" colspan="2" id="order-discount-label">Discount</th>
          <td id="order-discount"></td>
        </tr>
        <tr>
          <th scope="row" colspan="2">Total</th>
          <td id="order-total" class="fw-bold"></td>
        </tr>
      </tfoot>
    </table>
  </section>

  <template id="order-row-template">
    <tr>
      <td class="order-number"></td>
      <td class="order-placed"></td>
      <td class="order-status"></td>
      <td class="order-total"></td>
      <td><button class="btn btn-sm btn-outline-secondary" type="button">Open</button></td>
    </tr>
  </template>
  <template id="line-row-template">
    <tr>
      <td class="line-name"></td>
      <td class="line-quantity"></td>
      <td class="line-price"></td>
    </tr>
  </template>
`
