/**
 * The cart's markup: the table of teas, the discount form, the sums and the link to the checkout.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <div class="container">
    <div class="row mb-5">
      <div class="col-md-12">
        <p class="text-center" id="cart-message" role="status">Loading the cart...</p>
        <div class="site-blocks-table">
          <table class="table">
            <thead>
              <tr>
                <th class="product-thumbnail">Image</th>
                <th class="product-name">Tea</th>
                <th class="product-price">Price</th>
                <th class="product-quantity">Quantity</th>
                <th class="product-total">Total</th>
                <th class="product-remove">Remove</th>
              </tr>
            </thead>
            <tbody id="cart-lines"></tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <div class="row mb-5">
          <div class="col-md-6">
            <a class="btn btn-outline-black btn-sm w-100" href="./">Continue shopping</a>
          </div>
        </div>
        <form class="row" id="discount-form">
          <div class="col-md-12">
            <label class="text-black h4" for="discount-code">Discount code</label>
            <p>Enter your discount code if you have one.</p>
          </div>
          <div class="col-md-8 mb-3 mb-md-0">
            <input
              type="text"
              class="form-control py-3"
              id="discount-code"
              name="code"
              placeholder="Discount code"
            />
          </div>
          <div class="col-md-4">
            <button class="btn btn-black" type="submit">Apply</button>
          </div>
          <div class="col-md-12">
            <p class="mt-3 mb-0" id="discount-message" role="status"></p>
          </div>
        </form>
      </div>
      <div class="col-md-6 ps-md-5">
        <div class="row justify-content-end">
          <div class="col-md-7">
            <div class="row">
              <div class="col-md-12 text-md-end border-bottom mb-5">
                <h2 class="text-black h4 text-uppercase">Cart totals</h2>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6"><span class="text-black">Subtotal</span></div>
              <div class="col-6 text-end"><strong class="text-black" id="cart-subtotal">0 kr</strong></div>
            </div>
            <div class="row mb-3">
              <div class="col-6"><span class="text-black" id="cart-discount-label">Discount</span></div>
              <div class="col-6 text-end"><strong class="text-black" id="cart-discount">0 kr</strong></div>
            </div>
            <div class="row mb-5">
              <div class="col-6"><span class="text-black">Total</span></div>
              <div class="col-6 text-end"><strong class="text-black" id="cart-total">0 kr</strong></div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <a
                  class="btn btn-black btn-lg py-3 w-100 disabled"
                  href="checkout"
                  id="checkout-link"
                  aria-disabled="true"
                  tabindex="-1"
                  >Proceed to checkout</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <template id="cart-line-template">
    <tr>
      <td class="product-thumbnail"><img class="img-fluid line-image" src="" alt="" /></td>
      <td class="product-name" data-label="Tea"><h2 class="h5 text-black line-name"></h2></td>
      <td class="line-price" data-label="Price"></td>
      <td data-label="Quantity">
        <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px">
          <button class="btn btn-outline-black decrease" type="button">&minus;</button>
          <input type="text" class="form-control text-center quantity-amount" inputmode="numeric" />
          <button class="btn btn-outline-black increase" type="button">&plus;</button>
        </div>
      </td>
      <td class="line-total" data-label="Total"></td>
      <td data-label="Remove"><button class="btn btn-black btn-sm remove" type="button">X</button></td>
    </tr>
  </template>
`
