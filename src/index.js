require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const lightrail = require("lightrail-client");
const lightrailStripe = require('lightrail-stripe');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const uuid = require("uuid");
const views = require("./views");

// Check that the demo is configured.
if (!process.env.STRIPE_API_KEY
    || !process.env.LIGHTRAIL_API_KEY
    || !process.env.STRIPE_PUBLISHABLE_KEY
    || !process.env.SHOPPER_ID) {
    console.error("One or more environment variables necessary to run this demo is/are not set.  See README.md on setting these values.");
}

// Configure the Lightrail library.
lightrail.configure({
    apiKey: process.env.LIGHTRAIL_API_KEY,
});

const stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;

// Hardcoded values for the demo.
const orderTotal = 37500;
const orderCurrency = 'USD';
const shopperId = process.env.SHOPPER_ID;

/**
 * REST endpoint that simulates the charge and returns JSON.
 */
function simulate(req, res) {
    const splitTenderParams = {
        userSuppliedId: uuid.v4(),
        nsf: false,
        shopperId: req.body.shopperId,
        currency: req.body.currency,
        amount: req.body.amount
    };

    // Try to charge the whole thing to lightrail, and we'll use the amount that would actually get
    // charged when we do the real transaction.
    const lightrailShare = splitTenderParams.amount;

    lightrailStripe.simulateSplitTenderCharge(splitTenderParams, lightrailShare)
        .then(transaction => {
            res.send(transaction.lightrailTransaction);
        })
        .catch(err => {
            // Demos don't do proper error handling.
            console.error('Error simulating transaction', err);
            res.status(500).send('Internal error');
        });
}

/**
 * REST endpoint that performs the charge and returns HTML.
 */
function charge(req, res) {
    const stripeSource = req.body.source;

    const splitTenderParams = {
        amount: orderTotal,
        currency: orderCurrency,
        source: stripeSource,
        shopperId: shopperId,
        userSuppliedId: uuid.v4()
    };

    // The amount to actually charge to Lightrail, as determined in the simulation.
    const lightrailShare = req.body['lightrail-amount'];
    if (lightrailShare < 0) {
        res.status(400).send('Invalid value for Lightrail\'s share of the transaction');
    }

    lightrailStripe.createSplitTenderCharge(splitTenderParams, lightrailShare, stripe)
        .then(splitTenderCharge => {
            res.send(views.getCheckoutCompleteView(splitTenderCharge));
        })
        .catch(err => {
            // Demos don't do proper error handling.
            console.error('Error creating split tender transaction', err);
            res.status(500).send('Internal error');
        });
}

// ExpressJS configuration and routing.
const app = express();
app.use(express.static('rsc'));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => res.send(views.getCheckoutView(stripePublicKey, orderTotal, orderCurrency, shopperId)));
app.post('/charge', charge);
app.post('/simulate', simulate);
app.listen(3000, () => console.log('Lightrail demo running on http://localhost:3000'));
