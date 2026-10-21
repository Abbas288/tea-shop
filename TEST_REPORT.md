# Test Report

## Summary

The deployment environment is Cumulus over HTTPS. The address and access details are in
[Try the shop](README.md#try-the-shop). Local results and Cumulus results are listed separately.

The shop was tested in two ways:

| Kind                                                         | What it covers                                                                                                                 | How to run it                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **Automated** (Vitest)                                       | 135 tests in 16 files: the models' rules, the browser classes with fakes, and the API over HTTP with a real MongoDB in memory. | `npm test`                   |
| **Browser checks** (Playwright, assisted by Claude Opus 5.5) | Selected customer and admin flows through the pages, complemented by the automated API cases.                                  | The steps in the table below |

Local Playwright checks passed on 2026-10-21 in Chromium and Firefox: customer and admin flows at 375 and 1200 px
on `/` and `/tea-shop/`, plus desktop, tablet and phone layout checks from 320 to 1920 px. The table shows Chromium
at 1200 px on `/`; the other flow runs matched. The script is outside the repo and separate from `npm test`.

Run the browser cases against the [hosted demo](README.md#try-the-shop) or a
[local installation](README.md#run-locally). Admin cases require an account for that installation; local credentials
are configured in `.env`. Prepare the cart or order listed under _Input_ and reuse earlier setup where specified.
Run customer and unauthenticated admin cases signed out; sign in for admin order management.

The versions below describe the recorded local runs. Deployment verification is recorded under
[Cumulus verification](#cumulus-verification).

| Tool or setting | Version                                      |
| --------------- | -------------------------------------------- |
| Node.js         | 22.23.2                                      |
| Vitest          | 5.0.5                                        |
| Browsers        | Chromium and Firefox, from Playwright 1.64.1 |
| System          | Windows 11                                   |

A separate isolated layout check on 2026-10-21 passed all 32 browser, viewport and path combinations in Chromium and
Firefox, at `/` and `/1dv610/tea-shop/`. It checked the cup's size and unrotated appearance, the dots' alignment with the handle, the smaller
992–1199 px layout, hiding below 992 px and the absence of horizontal scrolling. This check served static app files
with product fixtures and did not test the order API or database.

[TC-E2E-1](E2E_TEST.md#tc-e2e-1-an-order-from-the-shop-to-delivered) follows one order from the shop to delivered,
as a customer and as the admin. It includes the footer's **Admin** link, a wrong password followed by a successful
login, status changes and undo, refreshing and resubmitting the tracking form, and returning to the shop after logout.

**What was hardest to test, and why:**

- **The pages themselves.** The web components and the page classes for tracking and the admin were checked through
  browser flows rather than separate unit tests. The page classes can also be tested with injected fakes; browser
  checks were prioritised here. A screenshot after loading missed that buttons faded in for 0.3 s, so the pages were
  also watched frame by frame while they loaded.
- **The admin's safety.** A customer can type HTML into a name, the admin's session can end in another tab, and
  another tab can change an order first. Each needs two sessions or a planned attack, so the table names them one by
  one.
- **The production environment on Cumulus.** HTTPS, session cookies through the proxy, and saved orders and undo
  history after a restart depend on the deployment configuration, so they have separate checks below.

## Test Results

✅ as expected · ⏳ not verified. _Automated_ means the case is a test in the named file.

| Test case                        | Requirement | Input                                                                                                                                                                                  | Expected outcome                                                                           | Actual outcome                                                                                                                             |
| -------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Teas on the shop page            | R1          | Opened `/`.                                                                                                                                                                            | Four teas, each with a name, a picture, a description and a price.                         | ✅ Black Jasmine 95 kr, Earl Grey 79 kr, Gunpowder Green 85 kr, Rooibos 69 kr, each with a picture and a description.                      |
| Add teas from the shop           | R2          | Clicked Earl Grey twice and Rooibos once, then opened `/cart`.                                                                                                                         | A message after each click. The cart has 2 Earl Grey and 1 Rooibos.                        | ✅ "Earl Grey in cart: 1" after the first click. The cart has Earl Grey × 2, Rooibos × 1.                                                  |
| Change the number of bags        | R2          | In the cart, clicked **+** and then **−** for Rooibos.                                                                                                                                 | 2 bags, then 1.                                                                            | ✅ As expected.                                                                                                                            |
| Too many bags                    | R2          | Typed `100` for Rooibos and pressed Tab.                                                                                                                                               | A message, and Rooibos stays at 1.                                                         | ✅ "A tea can have 1 to 99 bags." Rooibos stays at 1.                                                                                      |
| Cart after a reload              | R2          | Reloaded `/cart`.                                                                                                                                                                      | The same teas and bags.                                                                    | ✅ Earl Grey × 2, Rooibos × 1.                                                                                                             |
| Remove the last tea              | R2          | With only Rooibos in the cart, clicked **X** (Remove).                                                                                                                                 | An empty cart.                                                                             | ✅ "Your cart is empty."                                                                                                                   |
| Unknown discount code            | R3          | With no discount applied, typed `nope` and pressed Enter.                                                                                                                              | A message; the discount stays at 0 kr.                                                     | ✅ "Unknown discount code." Discount 0 kr.                                                                                                 |
| Discount code SAVE10             | R3          | Prepared 2 Earl Grey and 1 Rooibos, typed " save10 " (small letters, a space before and after) and clicked Apply.                                                                      | 10% off.                                                                                   | ✅ "SAVE10 takes 10% off." Discount (SAVE10) −23 kr.                                                                                       |
| Sums in the cart                 | R4          | 2 Earl Grey (79 kr) and 1 Rooibos (69 kr) with SAVE10.                                                                                                                                 | Subtotal 227 kr, discount −23 kr, total 204 kr (rounded to whole kronor).                  | ✅ As expected.                                                                                                                            |
| Empty checkout form              | R5          | With 2 Earl Grey and 1 Rooibos in the cart, clicked Place order with all delivery fields empty.                                                                                        | The browser points to the first empty field. No order is sent.                             | ✅ The browser's message for a required field. No order sent.                                                                              |
| Postal code with two digits      | R5          | Filled in the form with the postal code `35`.                                                                                                                                          | The browser refuses the postal code. No order is sent.                                     | ✅ The browser's message for a wrong format. No order sent.                                                                                |
| Bad details on the server        | R5          | _Automated_ (`orderFlow.test.js`): an email address without a dot, an empty cart, a tea the shop does not sell, an unknown code.                                                       | 400 with a message, and nothing is saved.                                                  | ✅ As expected.                                                                                                                            |
| The server's prices              | R6          | _Automated_ (`orderFlow.test.js`): 1 Rooibos and 2 Earl Grey, each sent with `price: 1`, and the code `save10`.                                                                        | Saved with the shop's prices: 227 kr, 23 kr off, 204 kr.                                   | ✅ As expected.                                                                                                                            |
| Place the order                  | R7          | Filled in a valid form (postal code `352 30`) and clicked Place order.                                                                                                                 | The receipt with the order number and how to track it. The cart is empty.                  | ✅ The receipt shows the generated order number and a tracking link. The saved cart is cleared.                                            |
| A refused order keeps the cart   | R7          | _Automated_ (`CheckoutPage.test.js`): separate simulated 400 and 500 responses.                                                                                                        | The cart stays, and the customer sees why.                                                 | ✅ As expected in both cases.                                                                                                              |
| Track an order                   | R8          | On `/track`, typed the number in small letters and `ada@example.se` (the order was placed as `Ada@Example.se`).                                                                        | Status, steps done and left, and no customer details.                                      | ✅ received; received yes, packed no, shipped no, delivered no. The answer has only the number, status, time and steps.                    |
| Track with another email address | R8          | The same number with `eve@example.se`.                                                                                                                                                 | 404 without order details; a message on the page.                                          | ✅ Page: "There is no order with this number and email address." API: 404 with only `status` and `message` ("There is no order to show."). |
| Admin page without login         | R9          | Opened `/admin`.                                                                                                                                                                       | The login page.                                                                            | ✅ `/admin-login` opens.                                                                                                                   |
| Wrong password                   | R9          | Logged in with the right email address and a wrong password.                                                                                                                           | A message, and still logged out.                                                           | ✅ "Wrong email address or password."                                                                                                      |
| Log in and out                   | R9          | Logged in, then clicked Log out and opened `/admin` again.                                                                                                                             | The orders, then the login page.                                                           | ✅ "Orders" after login. After logout, `/admin` opens `/admin-login`.                                                                      |
| Admin API without login          | R9          | _Automated_ (`adminOrders.test.js`): the four routes under `/api/admin/orders` without a session, and an unknown order number.                                                         | 401, and nothing changes.                                                                  | ✅ As expected.                                                                                                                            |
| Open, pack and undo              | R10         | Opened the new order, clicked **pack**, then **undo pack**.                                                                                                                            | received with pack and cancel → packed with ship, cancel and undo pack → received again.   | ✅ As expected.                                                                                                                            |
| A step that is not allowed       | R10         | _Automated_ (`adminOrders.test.js`): `ship` for a received order, `pack` for a cancelled one.                                                                                          | 409, and the status stays.                                                                 | ✅ As expected.                                                                                                                            |
| Undo step by step                | R10         | _Automated_ (`adminOrders.test.js`): pack, cancel, then undo twice.                                                                                                                    | packed, then received: back the way the order went, not the shortest way.                  | ✅ As expected.                                                                                                                            |
| Another tab changed the order    | R10         | Opened an order and clicked pack. In a second session, shipped it. Then clicked cancel in the first.                                                                                   | The reason, and the order as it is now.                                                    | ✅ "A shipped order cannot be changed with "cancel"." The page shows shipped. (2026-10-20)                                                 |
| Customer details as text         | R10         | Ordered with the name `<img src=x onerror="window.xssRan=true">Ada` and the street `<b>Storgatan 1</b>`, then opened the order as admin.                                               | Both shown as plain text. No script runs.                                                  | ✅ Shown as text. No HTML element was made, and the script did not run. (2026-10-20)                                                       |
| Cancel after shipping            | R11         | Packed and shipped the order in the panel.                                                                                                                                             | No cancel button. The server refuses cancel with 409 (_automated_, `adminOrders.test.js`). | ✅ The buttons are deliver and undo ship. The server answers 409.                                                                          |
| Local app restart                | R12         | Created, packed and shipped an order, then restarted the isolated Node.js process while keeping the temporary MongoDB running. Logged in again, reopened the order and undid shipping. | The status and undo history survive the app restart; a new admin login is required.        | ✅ The old session returned 401. After login, the order was shipped with undo ship available; undo restored packed.                        |
| HTTPS on Cumulus                 | R12         | Follow the HTTPS case in [Cumulus verification](#cumulus-verification).                                                                                                                | The shop and its resources load over HTTPS.                                                | ⏳ Not verified; see [Cumulus verification](#cumulus-verification).                                                                        |
| Demo notice                      | R13         | Opened `/checkout` and read the footer.                                                                                                                                                | A clear notice that nothing is paid or sent.                                               | ✅ "This is a demo shop. No real payment is made, and no tea is sent." The footer starts "Tea Shop is a demo."                             |

### Cumulus verification

Computer science students and staff at Linnaeus University can access the deployed app through the
[Cumulus demo](README.md#try-the-shop). Admin tests require an account for that deployment.
Deployment verification status as of **2026-10-21**. The local results above describe separate runs.

| Test case                           | Requirement | Input                                                                                                                                                                         | Expected outcome                                                                                                                                                                           | Actual outcome                                                                                                                                                                  |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS and resources                 | R12         | Open the Cumulus HTTPS address and navigate through shop, cart, checkout and tracking. Check the certificate and resource requests.                                           | Valid HTTPS; pages, images, CSS and JavaScript load without mixed content or failed requests.                                                                                              | ⏳ Not verified: certificate validation returned PartialChain in this environment. GET requests to the shop and products API with certificate validation disabled returned 404. |
| Production admin session            | R9          | Open admin while signed out, log in, navigate and reload, inspect the session cookie, then log out and try the protected admin API again.                                     | Login is required; the session survives navigation; the cookie has Secure, HttpOnly and SameSite=Strict; logout leaves protected API requests at 401.                                      | ⏳ Not verified on Cumulus.                                                                                                                                                     |
| Saved status and undo after restart | R12         | Create a new order, pack and ship it. Record its number, shipped status and undo ship. Restart the app, log in again and reopen that order. Use undo ship on this demo order. | The order is still shipped with undo ship available after restart; undo returns it to packed. A new admin login is required because the restart clears the server's stored login sessions. | ⏳ Not verified on Cumulus.                                                                                                                                                     |

For the complete customer and admin test procedure, see [E2E_TEST.md](E2E_TEST.md).

### Automated tests

`npm test` on 2026-10-21: **135 of 135 passed.**

| Files                                                                                  | Tests | What they check                                                                                                     |
| -------------------------------------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------- |
| `OrderModel`, `ProductModel`, `DiscountCodeModel`                                      |    24 | The rules in the schemas: customer details, bags, prices, codes.                                                    |
| `app.test.js`                                                                          |     3 | The pages and the ShoppingCart package are served.                                                                  |
| `browser/` (7 files)                                                                   |    63 | `ApiClient`, the cart and the shop, cart and checkout pages, with fakes instead of a browser.                       |
| `integration/` (`products`, `discountCodes`, `orderFlow`, `adminLogin`, `adminOrders`) |    45 | The API over HTTP with supertest and a MongoDB in memory: orders, prices, tracking, login, status changes and undo. |

Faults were also put into the code on purpose, one at a time, to see that the tests catch them, for example a missing
password check, a missing admin guard, a status that is not saved and an undo that does nothing. These listed faults
were caught. A separate tracking experiment reported six of seven injected faults caught by the automated suite;
the case-sensitive email comparison was instead found through a browser check.

### Not tested

Due to the lab's time constraints, I prioritised the main customer and admin flows. Further testing of the areas
below was not completed.

| What                                                                                             | Why, and what it means                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Separate unit tests for the web components and for `AdminPage`, `AdminLoginPage` and `TrackPage` | These were covered by the browser scenarios above; dedicated unit tests were not added.                                                          |
| A limit on login and tracking attempts                                                           | There is none, so someone can guess as often as they like.                                                                                       |
| The answer time of a login                                                                       | An unknown email address is answered faster than a wrong password, which shows whether the address is the admin's (from the code, not measured). |
| Many orders                                                                                      | The admin's list shows all orders on one page, without pagination or a search field.                                                             |

## Known Issues in Third-Party Modules

ShoppingCart ([rosa24-bth/1DV610-laboration-2](https://github.com/rosa24-bth/1DV610-laboration-2), tag
`laboration-2`). The first five were found by trying the module before it was used, on 2026-10-18, and the last two
while checking this report, on 2026-10-21. The last two do not affect the shop: the wrapper accepts only numbers and
never touches the cart's fields, and the server's schema checks every line of an order.

| Issue                                                       | How it shows                                                                                | How the shop handles it                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Errors give `false` or `null`, not an exception             | A bad call goes on silently.                                                                | In the browser, `ShoppingCartWrapper` throws instead (`QuantityError`, `TypeError`).             |
| Half bags are allowed                                       | `addItem` accepts 2.5 bags.                                                                 | The wrapper and the order schema allow only whole numbers from 1 to 99.                          |
| `getItems()` gives out its own list                         | Changing the list from outside changes the cart.                                            | The wrapper's `listLines()` gives new `CartLine` objects.                                        |
| A second `addItem` with the same name keeps the first price | A changed price is not used.                                                                | The cart keeps the first price; the server uses current product prices when the order is placed. |
| Totals are returned without rounding                        | 79 kr with 10% off gives 71.1 kr.                                                           | The shop rounds the total to whole kronor, in the browser and on the server.                     |
| A number of bags given as text is joined, not added         | `increaseItemQuantity('Rooibos', '2')` on 1 bag gives `"12"` bags and a subtotal of 828 kr. | The wrapper accepts only numbers.                                                                |
| The cart's fields are public                                | With a subtotal of 69 kr, `cart.discount = 500` gives a total of −276 kr.                   | The wrapper keeps the cart private and only calls its methods.                                   |
