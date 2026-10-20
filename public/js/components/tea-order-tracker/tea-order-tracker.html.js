/**
 * The tracking form and the order it finds, with a template for each step's row.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <form class="p-3 p-lg-5 border bg-white mb-5" id="tracking-form">
          <div class="mb-3">
            <label for="number" class="text-black">Order number <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              id="number"
              name="number"
              autocapitalize="characters"
              autocomplete="off"
              spellcheck="false"
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
              required
            />
          </div>
          <p class="mb-4" id="tracking-message" role="status" tabindex="-1">
            Enter the number from your receipt and the email address you ordered with.
          </p>
          <button class="btn btn-black btn-lg py-3 w-100" type="submit">Track order</button>
        </form>
        <div class="p-3 p-lg-5 border bg-white" id="tracking-result" hidden>
          <p class="mb-1">Order <strong id="order-number">-</strong></p>
          <p class="mb-1">Status: <strong id="order-status">-</strong></p>
          <p class="text-muted small mb-4">Last updated: <span id="last-updated">-</span></p>
          <table class="table site-block-order-table mb-0">
            <thead>
              <tr>
                <th>Step</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody id="steps"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <template id="step-template">
    <tr>
      <td class="step-name"></td>
      <td class="step-done"></td>
    </tr>
  </template>
`
