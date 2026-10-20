/**
 * The message in the corner about the cart, with its close button.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <div class="toast-container position-fixed bottom-0 end-0 p-3" role="status" aria-live="polite">
    <div class="toast" id="cart-toast">
      <div class="d-flex">
        <div class="toast-body"></div>
        <button class="btn-close me-2 m-auto" type="button" aria-label="Close"></button>
      </div>
    </div>
  </div>
`
