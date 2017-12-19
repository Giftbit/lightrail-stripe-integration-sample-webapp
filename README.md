# Lightrail Stripe Sample Web App
This project demonstrates how to use Lightrail's Drop-in Gift Card components. See our Drop-in Gift Card [documentation](https://github.com/Giftbit/Lightrail-API-Docs/blob/master/docs/quickstart/drop-in-gift-cards.md#drop-in-gift-cards) for a quick overview.  

This demo is implemented in 2 environments: NodeJS and PHP. (Ruby and Java examples are coming soon.) Each environment uses language-specific libraries for Lightrail and Lightrail-Stripe that we strongly recommend. Common display code is rendered using Mustache templates, but any similar technology will do.

## Configuring
This demo needs details about your Stripe and Lightrail accounts to run.

### Step 1: Setting Environment Config   
Inside the `shared` directory copy the file `.env.example` to a new file called `.env`. Set the variables as explained below. 
Be sure to use test credentials from both your Lightrail and Stripe accounts. 
- `LIGHTRAIL_API_KEY`: Generate an API key for your Lightrail account [here](https://www.lightrail.com/app/#/account/api);  
- `LIGHTRAIL_SHARED_SECRET`: From the same [page](https://www.lightrail.com/app/#/account/api) as where you generated an API key, scroll down to view your Shared Secret Key.
- `STRIPE_API_KEY` and `STRIPE_PUBLISHABLE_KEY`: Stripe API Key and Publishable Key; you can find this information in your Stripe account. 

#### Optional Fields
- `TITLE`: The title of the store.
- `SHOPPER_ID`: The shopper that will be interacting with the checkout page as well as the default shopper used for account management.
- `ORDER_TOTAL`: The total amount the shopper will be charged at checkout.

Note, the redemption widget will automatically create an account if no account exists yet for a given Shopper Token.
If you want to manually create an account for a Shopper Token go to the account management page to create and fund the account.

### Step 2: Drop-in Gift Card Setup
You'll need to setup your Drop-in Gift Card [template](https://www.lightrail.com/app/#/cards/dropin) within your Lightrail account.
For this demo use `http://localhost:3000/redeem?code={{fullcode}}` for the claim link.
The other values can be mock placeholders and are not necessary for testing the basic flow. 

## Running
See README.md inside each environment's directory for instructions on running.
