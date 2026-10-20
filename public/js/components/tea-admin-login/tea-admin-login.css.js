const STYLESHEET_PATHS = [
  '../../../vendor/furni/css/bootstrap.min.css',
  '../../../vendor/furni/css/style.css',
  '../../../vendor/bootstrap-examples/sign-in/signin.css',
]
const links = STYLESHEET_PATHS.map((path) => `<link rel="stylesheet" href="${new URL(path, import.meta.url)}" />`)

/**
 * Links to the stylesheets the login page loads, in the same order.
 */
export const cssTemplate = document.createElement('template')
cssTemplate.innerHTML = `
  ${links.join('')}
  <style>
    /* The page centers the form with flex. Without a width, the host would shrink to the size of the form. */
    :host {
      display: block;
      width: 100%;
    }
  </style>
`
