# Lightrail Stripe Sample Node Web App

This project demonstrates how to use Lightrail and Stripe to create an account, add credit to an account, and use the account credit on Stripe checkout.  It uses the [JavaScript Lightrail client](https://github.com/Giftbit/lightrail-client-javascript) and the [JavaScript Lightrail-Stripe Integration Library](https://github.com/Giftbit/lightrail-stripe-javascript).

The concepts used by this demo are covered in the use-case document [https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md](https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md).  It's worth scanning that document before continuing.

## Configuring

This demo needs details about your personal Lightrail and Stripe test accounts to run.  Copy `~.env` to `.env` and set the environment variables as follows...

- `LIGHTRAIL_API_KEY`: Lightrail API Key that you can generate and paste from your Lightrail account via Lightrail Web App. For this demo use test credentials.
- `STRIPE_API_KEY` and `STRIPE_PUBLISHABLE_KEY`: Stripe API Key and Publishable Key; you can find this information in your Stripe account. For this demo use test credentials.

The above parameters need to be set for this demo as well as any production application. For setting up this particular demo, you can also set the following parameters:

- `SHOPPER_ID`: the shopper that will be interacting with the checkout page as well as the default shopper used for account management.
- `ORDER_TOTAL`: the total amount the shopper will be charged at checkout.

If the shopper with that shopperId doesn't exist or doesn't have a USD account yet, go to the account management page to create and fund the account.

## Running

- You need a recent version of [node](https://nodejs.org/en/).
- Install all node dependencies with the command: `npm install`.
- Start the application with the command `node src`.
- Open http://localhost:3000 in your web browser.

## Implementation details

- Creating and credting an account uses the [JavaScript Lightrail client](https://github.com/Giftbit/lightrail-client-javascript).
- Split tender transactions between Lightrail and Stripe are done with the [JavaScript Lightrail-Stripe Integration Library](https://github.com/Giftbit/lightrail-stripe-javascript).
