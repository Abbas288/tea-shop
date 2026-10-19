/**
 * The checkout's markup: the delivery form, the order with its sums and the button that places it.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <div class="container">
    <form class="row" id="checkout-form">
      <div class="col-md-6 mb-5 mb-md-0">
        <h2 class="h3 mb-3 text-black">Delivery details</h2>
        <div class="p-3 p-lg-5 border bg-white">
          <div class="mb-3">
            <label for="name" class="text-black">Name <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              id="name"
              name="name"
              autocomplete="name"
              maxlength="100"
              pattern=".*\\S.*"
              required
            />
          </div>
          <div class="mb-3">
            <label for="email" class="text-black">Email address <span class="text-danger">*</span></label>
            <input
              type="email"
              class="form-control"
              id="email"
              name="email"
              autocomplete="email"
              maxlength="100"
              pattern="(?!.*\\.\\.)[^\\s@]+@[^\\s@.]+\\.[^\\s@]*[^\\s@.]"
              required
            />
          </div>
          <div class="mb-3">
            <label for="street" class="text-black">Street address <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              id="street"
              name="street"
              autocomplete="address-line1"
              maxlength="100"
              pattern=".*\\S.*"
              required
            />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3 mb-md-0">
              <label for="postal-code" class="text-black">Postal code <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                id="postal-code"
                name="postalCode"
                autocomplete="postal-code"
                inputmode="numeric"
                maxlength="6"
                pattern="\\d{3} ?\\d{2}"
                aria-describedby="postal-code-hint"
                required
              />
              <div class="form-text" id="postal-code-hint">Five digits, such as 352 52.</div>
            </div>
            <div class="col-md-6">
              <label for="city" class="text-black">City <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                id="city"
                name="city"
                autocomplete="address-level2"
                maxlength="100"
                pattern=".*\\S.*"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h2 class="h3 mb-3 text-black">Your order</h2>
        <div class="p-3 p-lg-5 border bg-white">
          <table class="table site-block-order-table mb-5">
            <thead>
              <tr>
                <th scope="col">Tea</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody id="order-lines"></tbody>
            <tfoot>
              <tr>
                <th scope="row" class="text-black">Subtotal</th>
                <td class="text-black" id="order-subtotal">0 kr</td>
              </tr>
              <tr>
                <th scope="row" class="text-black" id="order-discount-label">Discount</th>
                <td class="text-black" id="order-discount">0 kr</td>
              </tr>
              <tr>
                <th scope="row" class="text-black">Order total</th>
                <td class="text-black fw-bold" id="order-total">0 kr</td>
              </tr>
            </tfoot>
          </table>
          <template id="order-line-template">
            <tr>
              <td>
                <span class="line-name"></span> <strong class="mx-2">x</strong> <span class="line-quantity"></span>
              </td>
              <td class="line-total"></td>
            </tr>
          </template>
          <p class="border p-3 mb-4">This is a demo shop. No real payment is made, and no tea is sent.</p>
          <p class="mb-4" id="checkout-message" role="status" tabindex="-1">Loading your order...</p>
          <button class="btn btn-black btn-lg py-3 w-100" type="submit" disabled>Place order</button>
        </div>
      </div>
    </form>
  </div>
`
