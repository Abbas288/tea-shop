# tea-admin-login

The admin's login form, from Bootstrap's Sign-in example.

```html
<tea-admin-login></tea-admin-login>
```

```js
import './components/tea-admin-login/index.js'

const loginForm = document.querySelector('tea-admin-login')
loginForm.onLogIn(({ email, password }) => console.log(email))
```

| Method                      | Does                                                                              |
| --------------------------- | --------------------------------------------------------------------------------- |
| `onLogIn(handler)`          | Calls the handler with the email address and password when the admin sends them.  |
| `showLoggingIn()`           | Disables the button while the login is checked.                                   |
| `showLoginRefused(message)` | Shows why the admin is not logged in, enables the button and focuses the message. |
| `goToPanel()`               | Opens the admin page.                                                             |

Built on `../TeaElement.js`, with its own stylesheets: Bootstrap, Furni's `style.css` and the Sign-in example's
`signin.css`, the ones the login page loads. The component stays hidden until they have loaded.
