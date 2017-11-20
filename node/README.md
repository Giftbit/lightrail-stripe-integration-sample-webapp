# Lightrail Stripe Sample Node Web App

This project demonstrates how to use Lightrail and Stripe to create an account, add credit to an account, and use the account credit on Stripe checkout.  It uses the [JavaScript Lightrail client](https://github.com/Giftbit/lightrail-client-javascript) and the [JavaScript Lightrail-Stripe Integration Library](https://github.com/Giftbit/lightrail-stripe-javascript).

The concepts used by this demo are covered in the use-case document [https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md](https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md).  It's worth scanning that document before continuing.

## Configuring

See the [base document](../README.md) on configuring.

## Running

- You need a recent version of [node](https://nodejs.org/en/).
- Install all node dependencies with the command: `npm install`.
- Start the application with the command `node src`.
- Open http://localhost:3000 in your web browser.

## Implementation details

- Creating and credting an account uses the [JavaScript Lightrail client](https://github.com/Giftbit/lightrail-client-javascript).
- Split tender transactions between Lightrail and Stripe are done with the [JavaScript Lightrail-Stripe Integration Library](https://github.com/Giftbit/lightrail-stripe-javascript).
