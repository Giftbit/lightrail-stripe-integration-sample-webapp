require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const lightrail = require("lightrail-client");
const lightrailStripe = require('lightrail-stripe');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const uuid = require("uuid");
const views = require("./views");

if (!process.env.STRIPE_API_KEY
    || !process.env.LIGHTRAIL_API_KEY
    || !process.env.LIGHTRAIL_CLIENT_SECRET
    || !process.env.STRIPE_PUBLISHABLE_KEY
    || !process.env.SHOPPER_ID) {
    console.error("One or more environment variables necessary to run this demo is/are not set.  See README.md on setting these values.");
}

// Configure the Lightrail library.
lightrail.configure({
    apiKey: process.env.LIGHTRAIL_API_KEY,
    sharedSecret: process.env.LIGHTRAIL_CLIENT_SECRET
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
    lightrail.contacts.getContactByUserSuppliedId(shopperId)
        .then(contact => {
            if (!contact) {
                throw new Error(`contact not found with shopperId '${shopperId}'`);
            }
            return lightrail.cards.getAccountCardByContactAndCurrency(contact, orderCurrency)
        })
        .then(card => {
            const splitTenderParams = {
                userSuppliedId: uuid.v4(),
                nsf: false,
                shopperId: req.body.shopperId,
                currency: req.body.currency,
                amount: req.body.amount
            };
            return lightrailStripe.simulateSplitTenderCharge(
                splitTenderParams,
                splitTenderParams.amount
            );
        })
        .then(transaction => {
            res.send(transaction.lightrailTransaction);
        })
        .catch(err => {
            console.error('Error simulating transaction', err);
            res.status(500).send('Internal error');
        });
}

/**
 * REST endpoint that performs the charge and returns HTML.
 */
function charge(req, res) {
    const stripeSource = req.body.source;
    const lightrailShare = req.body['lightrail-amount'];
    if (lightrailShare < 0) {
        res.status(400).send('Invalid value for Lightrail\'s share of the transaction');
    }

    const splitTenderParams = {
        amount: orderTotal,
        currency: orderCurrency,
        source: stripeSource,
        shopperId: shopperId,
        userSuppliedId: uuid.v4()
    };
    lightrailStripe.createSplitTenderCharge(splitTenderParams, lightrailShare, stripe)
        .then(splitTenderCharge => {
            res.send(views.getCheckoutCompleteView(
                splitTenderCharge.lightrailTransaction ? splitTenderCharge.lightrailTransaction.value : 0,
                splitTenderCharge.stripeCharge ? splitTenderCharge.stripeCharge.amount / 100 : 0
            ));
        })
        .catch(err => {
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
app.listen(3000, () => console.log('Example app listening on port 3000!'));
