## Configuring
See the [base document](../README.md) on configuring.

## Running
- You need a recent version of [node](https://nodejs.org/en/).
- Install all node dependencies with the command: `npm install`.
- Start the application with the command `node src`.
- Open http://localhost:3000 in your web browser.

## Implementation Details
- Creating and crediting an account uses the [Lightrail Javascript Client](https://github.com/Giftbit/lightrail-client-javascript).
- Split tender transactions between Lightrail and Stripe are done with the [Lightrail-Stripe Javascript Integration Library](https://github.com/Giftbit/lightrail-stripe-javascript).
