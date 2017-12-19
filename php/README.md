# PHP: Lightrail Stripe Sample Web App

## Configuring
See the [base document](../README.md) on configuring.

## Running
- You need [Composer](https://getcomposer.org/) to fetch dependencies and [Docker](https://www.docker.com/) to run the LAMP container.
- Install all PHP dependencies with the command: `composer update`.
- Start the application in Docker with the command `docker-compose up`.
- Open http://localhost:3000 in your web browser.

## Implementation Details
- Creating and crediting an account uses the [Lightrail PHP client](https://github.com/Giftbit/lightrail-client-php).
- Split tender transactions between Lightrail and Stripe are done with the [Lightrail-Stripe PHP Integration Library](https://github.com/Giftbit/lightrail-stripe-php)