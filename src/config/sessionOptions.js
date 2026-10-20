// Options for express-session. The sessions are kept in memory, so a restart of the server logs the admin out.
export const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    // The browser sends the cookie only with requests from the shop's own pages.
    sameSite: 'strict',
  },
}

if (process.env.NODE_ENV === 'production') {
  sessionOptions.cookie.secure = true
}
