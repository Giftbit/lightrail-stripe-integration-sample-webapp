# Lightrail Stripe Sample Node Web App

## Configuration

This demo needs details about your personal Lightrail test account to run.  Copy `~.env` to `.env` and set the environment variables as follows...

- `LIGHTRAIL_API_KEY` and `LIGHTRAIL_CLIENT_SECRET`: Lightrail API Key and Client Secret; you can generate and paste these values from your Lightrail account via Lightrail Web App. For the purpose of the demo use test credentials.
- `STRIPE_API_KEY` and `STRIPE_PUBLISHABLE_KEY`: Stripe API Key and Publishable Key; you can find this information in your Stripe account. For the purpose of the demo use test credentials.

The above parameters need to be set for this demo as well as any production application. For setting up this particular demo, you also need to set up the following parameter based on a demo Contact in your test Lightrail environment. This Contact must have a `USD` Account Card with some available balance on it. 

If you have just created your Lightrail account, you can leave this parameter to it its default value `alice`; there is already a Contact by this `shopperId` in your default test data with $50 value in her USD Account Card.    

- `shopperId`: Shopper ID refers to the client-provided identifier (a.k.a. `userSuppliedId`) for a Lightrail Contact to be used in this demo. 

Note that once you test the checkout process with this Contact the available balance on the Account may reach zero in which case you need to recharge the account or issue refunds using the Lightrail Web App in order to keep testing the demo.

## Running

- You need a recent version of [node](https://nodejs.org/en/).
- Install all node dependencies with the command: `npm install`.
- Start the application with the command `node src`.
- Open http://localhost:3000 in your web browser.

### Stripe Test Credit Card

## Customizing for your System 

### Frontend

Here is all what you need at the front-end to set up your checkout:

```html
<div id="ltrl-payment-summary" class="ltrl-container">
  <script src="js/stripesample.js"
            data-title="..."
            data-logo="..."
            data-total="..."
            data-currency="..."
            data-shopperId="..."
            data-stripePK="..."
            data-lightrailToken="..."
            data-checkout-endpoint="..."
            data-simulate-endpoint="...">
    </script>
 </div>
```

The script will:

- Check the available account balance of the the customer identified by `<shopperId>`,
- Generate a tabular summary of the transaction breakdown, i.e. how much will be charged to customer's account and how much will be charged to their credit card, and
- Load the Stripe credit card widget if there is anything to be charged to a credit card.

Once the customer approves and submits this form, it will get submitted to the backend endpoint specified by the `'data-checkout-endpoint'` attribute. 

Here are the parameters you need to set when serving this page:

#### Title and Logo

A title and logo to be shown on the checkout form. Make sure the logo is served from an `https` server. 

#### Total and Currency

The total amount you want to charge and its currency. This is usually coming from a Cart or Order object in your store system.

#### ShopperId

The identifier of the customer at the checkout. This is normally stored in the session after the user logs in.

#### Stripe Publishable Key

Your Stripe Publishable Key from your Stripe account. 

#### Lightrail Token

Lightrail Token is a temporary credential you issue in order to authorize the page to check the balance of the customer's account. To generate this token, use the `generateShopperToken` function from a suitable client library for your platform/language. The input parameters are:

- The `shopperId` to identify which customer is logged in. The resulting token will only authorize checking the balance of this customer.
- An optional validity period in seconds. Choose a suitable value for this depending on the needs of your checkout workflow.

For example, in the JS library you can do this as the following: 

```javascript
const lightrail = require('lightrail-client');

lightrail.configure({
    apiKey: '...',      // Your Lightrail API key. Find or create one using the Lightrail Web App after logging into your account.
    sharedSecret: '...' // Your Lightrail client secret. Find or create one using the Lightrail Web App after logging into your account.
});

const shopperId = '...';    // Identify the logged-in customer.
const lightrailToken = lightrail.generateShopperToken({shopperId: shopperId});
```

### Backend 

In order to finalize the checkout and charge the credit card and the Lightrail account, you need to have a method in your backend. If you already process Stripe payments, you are already familiar with this method as explained in Stripe's [documentation](https://stripe.com/docs/charges).

The [lightrail-stripe-javascript](https://github.com/Giftbit/lightrail-stripe-javascript) project makes this easy.  See that project's documentation and `charge()` in [index.js](./index.js) for an example of how to use it.
