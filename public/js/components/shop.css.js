const STYLESHEET_PATHS = [
  '../../vendor/furni/css/bootstrap.min.css',
  '../../vendor/furni/css/style.css',
  '../../css/shop.css',
]

/**
 * Links to the stylesheets every page loads, in the same order. The page's styles do not reach into a shadow root.
 */
export const cssTemplate = document.createElement('template')
cssTemplate.innerHTML = STYLESHEET_PATHS.map(
  (path) => `<link rel="stylesheet" href="${new URL(path, import.meta.url)}" />`
).join('')
