# Lightrail Stripe Sample Web App

This project demonstrates how to use Lightrail and Stripe to create an account, add credit to an account, and use the account credit on Stripe checkout.  It uses Mustache templates and language-specific libraries for Lightrail and Lightrail-Stripe

The concepts used by this demo are covered in the use-case document [https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md](https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md).  It's worth scanning that document before continuing.

## Configuring

This demo needs details about your personal Lightrail and Stripe test accounts to run.  Inside the `shared` directory copy `.env.example` to `.env` and set the environment variables as follows...

- `LIGHTRAIL_API_KEY` and `LIGHTRAIL_SHARED_SECRET`: Lightrail API Key and shared secret that you can generate and paste from your Lightrail account via Lightrail Web App. For this demo use test credentials.
- `STRIPE_API_KEY` and `STRIPE_PUBLISHABLE_KEY`: Stripe API Key and Publishable Key; you can find this information in your Stripe account. For this demo use test credentials.

The above parameters need to be set for this demo as well as any production application. For setting up this particular demo, you can also set the following parameters:

- `TITLE`: the title of the store.
- `SHOPPER_ID`: the shopper that will be interacting with the checkout page as well as the default shopper used for account management.
- `ORDER_TOTAL`: the total amount the shopper will be charged at checkout.

If the shopper with that shopperId doesn't exist or doesn't have a USD account yet, go to the account management page to create and fund the account.

## Running

See README.md inside each environment's directory for instructions on running.
