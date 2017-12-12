# Lightrail Stripe Sample Web App
This project demonstrates how to use Lightrail's Drop-in Gift Card components. See our [documentation](https://github.com/Giftbit/Lightrail-API-Docs/blob/master/docs/quickstart/drop-in-gift-cards.md#drop-in-gift-cards) for a quick overview.  

It uses Mustache templates and language-specific libraries for Lightrail and Lightrail-Stripe

## Configuring
This demo needs details about your Stripe and Lightrail accounts to run.

### Step 1: Creating the '.env'   
Inside the `shared` directory copy `.env.example` to `.env` and set the variables as explained below.
- `LIGHTRAIL_API_KEY`: Generate an API key for your Lightrail account [here](https://www.lightrail.com/app/#/account/api);  
- `LIGHTRAIL_SHARED_SECRET`: From the same [page](https://www.lightrail.com/app/#/account/api) as where you generated an API key, scroll down to view your Shared Secret Key.
- `STRIPE_API_KEY` and `STRIPE_PUBLISHABLE_KEY`: Stripe API Key and Publishable Key; you can find this information in your Stripe account. For this demo use test credentials.

#### Optional Environment Config
Optional `.env` parameters:
- `TITLE`: the title of the store.
- `SHOPPER_ID`: the shopper that will be interacting with the checkout page as well as the default shopper used for account management.
- `ORDER_TOTAL`: the total amount the shopper will be charged at checkout.

If the shopper with that `shopperId` doesn't exist or doesn't have a USD account yet, go to the account management page to create and fund the account.

### Step 2: Drop-in Gift Card Setup
You'll need your Drop-in Gift Card [template](https://www.lightrail.com/app/#/cards/dropin) within your Lightrail account.
For this demo use `http://localhost:3000/redeem?code={{fullcode}}` for the claim link.
The other values can be basic placeholders and are not necessary for testing the basic flow. 

## Running
See README.md inside each environment's directory for instructions on running.
