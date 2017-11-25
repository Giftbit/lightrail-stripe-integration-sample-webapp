# Lightrail Stripe Sample PHP Web App

This project demonstrates how to use Lightrail and Stripe to create an account, add credit to an account, and use the account credit on Stripe checkout.  It uses the [PHP Lightrail client](https://github.com/Giftbit/lightrail-client-php) and the [PHP Lightrail-Stripe Integration Library](https://github.com/Giftbit/lightrail-stripe-php).

The concepts used by this demo are covered in the use-case document [https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md](https://github.com/Giftbit/Lightrail-API-Docs/blob/master/use-cases/account-credits.md).  It's worth scanning that document before continuing.

## Configuring

See the [base document](../README.md) on configuring.

## Running

- You need [Composer](https://getcomposer.org/) to fetch dependencies and [Docker](https://www.docker.com/) to run the LAMP container.
- Install all PHP dependencies with the command: `composer update`.
- Start the application in Docker with the command `docker-compose up`.
- Open http://localhost:3000 in your web browser.
