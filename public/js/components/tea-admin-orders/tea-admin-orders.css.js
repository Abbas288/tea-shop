const STYLESHEET_PATHS = ['../../../vendor/furni/css/bootstrap.min.css', '../../../css/admin.css']

/**
 * Links to Bootstrap and the admin page's own rules. The page's styles do not reach into a shadow root.
 */
export const cssTemplate = document.createElement('template')
cssTemplate.innerHTML = STYLESHEET_PATHS.map(
  (path) => `<link rel="stylesheet" href="${new URL(path, import.meta.url)}" />`
).join('')
