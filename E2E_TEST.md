# End-to-end test

This test follows a customer and an admin through a complete order, from choosing teas to delivery.

## TC-E2E-1: An order from the shop to delivered

One customer orders tea and follows the order. The admin moves it from received to delivered, with an undo on the
way. The test follows the normal order journey through the pages, covering parts of
[R1–R11 and R13](README.md#requirements). Additional requirement cases are in [TEST_REPORT.md](TEST_REPORT.md).

**Preconditions**

- Use the Cumulus HTTPS address in [Try the shop](README.md#try-the-shop). Start signed out with an empty cart, for
  example in a private browser window.
- Use the test admin account supplied privately with the submission.

The Cumulus base address is `https://cu3133.camp.lnu.se/1dv610/tea-shop/`. The **Admin** link in the footer opens the
login page within this base. Locally, the same link opens `http://localhost:3000/admin-login`.

For a local repeat, follow [Run locally](README.md#run-locally) and use the admin credentials from your own `.env`.

**Steps**

| #   | Do this                                                                                                          | Check that                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [Open the shop on Cumulus](https://cu3133.camp.lnu.se/1dv610/tea-shop/).                                         | Four teas show with pictures and prices: Black Jasmine 95 kr, Earl Grey 79 kr, Gunpowder Green 85 kr, Rooibos 69 kr. The hero says it is a demo shop.                       |
| 2   | Click Earl Grey twice and Rooibos once.                                                                          | A message shows after each click, the first one "Earl Grey in cart: 1".                                                                                                     |
| 3   | Open the cart.                                                                                                   | Earl Grey × 2 and Rooibos × 1, subtotal 227 kr.                                                                                                                             |
| 4   | Enter `SAVE10` and click Apply.                                                                                  | Discount −23 kr, total 204 kr.                                                                                                                                              |
| 5   | Go to the checkout.                                                                                              | The order total is 204 kr.                                                                                                                                                  |
| 6   | Fill in Ada Lind, `Ada@Example.se`, Storgatan 1, `352 30`, Växjö, and click Place order. Then open the cart.     | The receipt shows an order number of 8 characters. The cart says "Your cart is empty."                                                                                      |
| 7   | In a new tab, open the tracking page and enter the order number and `ada@example.se`.                            | Status received. Steps: received yes, packed no, shipped no, delivered no.                                                                                                  |
| 8   | In a third tab, open the shop and scroll to the bottom. Click **Admin** in the footer (on the right on desktop). | The admin login page opens (`admin-login`).                                                                                                                                 |
| 9   | Log in with the correct email address and a wrong password.                                                      | "Wrong email address or password."                                                                                                                                          |
| 10  | Log in with the correct email address and password.                                                              | The orders appear with the new order at the top.                                                                                                                            |
| 11  | Open the new order.                                                                                              | Customer Ada Lind, `Ada@Example.se`. Sums 227 kr, −23 kr, 204 kr. Buttons pack and cancel.                                                                                  |
| 12  | Click **pack**.                                                                                                  | The order is packed. The admin can move it on to shipped and then delivered, undo the transitions one at a time back to received, or cancel while it is received or packed. |
| 13  | Click **undo pack**, then **pack** and **ship**.                                                                 | After the undo, the status is received. After ship, the buttons are deliver and undo ship: no cancel.                                                                       |
| 14  | Refresh the page in the tracking tab. Enter the same order number and email address, then click **Track order**. | Status shipped. Steps: received, packed and shipped yes, delivered no.                                                                                                      |
| 15  | In the admin tab, click **deliver**.                                                                             | The only button left is undo deliver.                                                                                                                                       |
| 16  | Load the admin page again.                                                                                       | The order is still delivered in the list.                                                                                                                                   |
| 17  | Track the order again.                                                                                           | Status delivered, every step yes.                                                                                                                                           |
| 18  | Click **Log out**, then click **Back to the shop** below the login form.                                         | The login page opens after logout. Clicking **Back to the shop** returns to the shop page.                                                                                  |

**Expected result:** the whole flow works without an error. The customer can order and see the order's real status at
each step. The admin can only make the changes the order allows, can undo one, and needs a login. The order keeps its
status when the page is loaded again.

**Status**

The entries below are dated **2026-10-21**.

| Run                                          | Result                                                       |
| -------------------------------------------- | ------------------------------------------------------------ |
| Local, Chromium at 1200 px on `/`            | ✅ Passed                                                    |
| Local, Firefox at 1200 px on `/`             | ✅ Passed                                                    |
| Local, Chromium at 375 px under `/tea-shop/` | ✅ Passed                                                    |
| Cumulus over HTTPS                           | ✅ Passed: the customer and admin flow completed over HTTPS. |

For HTTPS, session and restart checks, see
[Cumulus verification](TEST_REPORT.md#cumulus-verification).
