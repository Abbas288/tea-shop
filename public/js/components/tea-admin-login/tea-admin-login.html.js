/**
 * The login form from Bootstrap's Sign-in example, with a line for messages.
 */
export const htmlTemplate = document.createElement('template')
htmlTemplate.innerHTML = `
  <main class="form-signin">
    <form id="login-form">
      <h1 class="h3 mb-3 fw-normal">Tea Shop admin</h1>

      <div class="form-floating">
        <input
          type="email"
          class="form-control"
          id="email"
          name="email"
          placeholder="name@example.com"
          autocomplete="username"
          required
        />
        <label for="email">Email address</label>
      </div>
      <div class="form-floating">
        <input
          type="password"
          class="form-control"
          id="password"
          name="password"
          placeholder="Password"
          autocomplete="current-password"
          required
        />
        <label for="password">Password</label>
      </div>

      <p class="small mb-2" id="login-message" role="status" tabindex="-1"></p>
      <button class="w-100 btn btn-lg btn-primary" type="submit">Log in</button>
      <p class="mt-5 mb-3 text-muted"><a href="./">Back to the shop</a></p>
    </form>
  </main>
`
