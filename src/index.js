require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const lightrail = require("lightrail-client");
const lightrailStripe = require('lightrail-stripe');
const mustacheExpress = require("mustache-express");
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

// Configuration for the demo.
const staticParams = {
    title: "Avocado Millennium",
    logo: "img/avocado.png",
    orderTotal: 37500,
    orderTotalInCents: () => this.orderTotal / 100,
    currency: "USD",
    stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    shopperId: process.env.SHOPPER_ID
};

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
    console.log("charge req.body=", req.body);

    const splitTenderParams = {
        amount: staticParams.orderTotal,
        currency: staticParams.currency,
        source: req.body.source,
        shopperId: staticParams.shopperId,
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
app.use(express.static('rsc/static'));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/../rsc/views');
// app.get('/', (req, res) => res.send(views.getCheckoutView(stripePublicKey, orderTotal, orderCurrency, shopperId)));
app.get('/', (req, res) => res.render('index.html', staticParams));
app.post('/charge', charge);
app.post('/simulate', simulate);
app.listen(3000, () => console.log('Lightrail demo running on http://localhost:3000'));
