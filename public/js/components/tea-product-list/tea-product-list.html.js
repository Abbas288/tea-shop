/**
 * The shop's product section: the row the teas go in, and the markup of one tea.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <div class="untree_co-section product-section before-footer-section">
    <div class="container">
      <div class="row" id="products">
        <p class="col-12 text-center">Loading the teas...</p>
      </div>
    </div>
  </div>
  <template id="product-template">
    <div class="col-12 col-md-6 col-lg-3 mb-5">
      <button class="product-item" type="button">
        <img class="img-fluid product-thumbnail" src="" alt="" />
        <span class="product-title"></span>
        <span class="product-description small"></span>
        <strong class="product-price"></strong>
        <span class="icon-cross"
          ><img src="vendor/furni/images/cross.svg" class="img-fluid" alt="Add to cart"
        /></span>
      </button>
    </div>
  </template>
`
