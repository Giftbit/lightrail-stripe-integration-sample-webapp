const bodyParser = require("body-parser");
const express = require("express");
const lightrail = require("lightrail-client");
const lightrailStripe = require("lightrail-stripe");
const mustacheExpress = require("mustache-express");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const uuid = require("uuid");

// Load and check config.
require("dotenv").config({path: path.join(__dirname, "..", "..", "shared", ".env")});
if (!process.env.STRIPE_API_KEY
    || !process.env.LIGHTRAIL_API_KEY
    || !process.env.STRIPE_PUBLISHABLE_KEY
    || !process.env.TITLE
    || !process.env.LOGO
    || !process.env.SHOPPER_ID
    || !process.env.ORDER_TOTAL) {
    console.error("One or more environment variables necessary to run this demo is/are not set.  See README.md on setting these values.");
}

// Configure the Lightrail library.
lightrail.configure({
    apiKey: process.env.LIGHTRAIL_API_KEY
});

// Configuration for the demo.
const staticParams = {
    title: process.env.TITLE,
    logo: process.env.LOGO,
    orderTotal: parseInt(process.env.ORDER_TOTAL),
    orderTotalDisplay: parseInt(process.env.ORDER_TOTAL) / 100,
    currency: "USD",
    stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    shopperId: process.env.SHOPPER_ID
};

/**
 * REST endpoint that simulates the charge and returns JSON.
 */
function simulate(req, res) {
    console.log("simulate body=", req.body);

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
            // Demos don"t do proper error handling.
            console.error("Error simulating transaction", err);
            res.status(500).send("Internal error");
        });
}

/**
 * REST endpoint that performs the charge and returns HTML.
 */
function charge(req, res) {
    console.log("charge body=", req.body);

    const splitTenderParams = {
        amount: staticParams.orderTotal,
        currency: staticParams.currency,
        source: req.body.source,
        shopperId: staticParams.shopperId,
        userSuppliedId: uuid.v4()
    };

    // The amount to actually charge to Lightrail, as determined in the simulation.
    const lightrailShare = req.body["lightrail-amount"];
    if (lightrailShare < 0) {
        res.status(400).send("Invalid value for Lightrail\"s share of the transaction");
    }

    lightrailStripe.createSplitTenderCharge(splitTenderParams, lightrailShare, stripe)
        .then(splitTenderCharge => {
            res.render("checkoutComplete.html", {
                lightrailTransactionValue: splitTenderCharge.lightrailTransaction ? splitTenderCharge.lightrailTransaction.value / -100 : 0,
                stripeChargeValue: splitTenderCharge.stripeCharge ? splitTenderCharge.stripeCharge.amount / 100 : 0
            });
        })
        .catch(err => {
            // Demos don"t do proper error handling.
            console.error("Error creating split tender transaction", err);
            res.status(500).send("Internal error");
        });
}

/**
 * REST endpoint that creates an account and returns a message string.
 */
function createAccount(req, res) {
    console.log("createAccount body=", req.body);

    const shopperId = req.body.shopperId;
    lightrail.accounts.createAccount(
        {
            shopperId: shopperId
        },
        {
            userSuppliedId: `accountcard-${shopperId}-${staticParams.currency}`,
            currency: staticParams.currency,
            cardType: "ACCOUNT_CARD"
        })
        .then(() => {
            res.send(`account created (or already exists) for shopperId ${shopperId}`);
        })
        .catch(err => {
            console.error("Error creating account card", err);
            res.status(500).send("Internal error");
        });
}

/**
 * REST endpoint that credits (funds) an account and returns a message string.
 */
function creditAccount(req, res) {
    console.log("creditAccount body=", req.body);

    const shopperId = req.body.shopperId;
    const value = req.body.value;

    if (value <= 0) {
        res.status(400).send("value must be > 0");
        return;
    }

    lightrail.accounts.createTransaction(
        {
            shopperId: shopperId
        },
        {
            value: value,
            currency: staticParams.currency,
            userSuppliedId: uuid.v4()
        })
        .then(() => {
            res.send(`account for shopperId ${shopperId} funded by ${value}`);
        })
        .catch(err => {
            console.error("Error creating account card", err);
            res.status(500).send("Internal error");
        });
}

// ExpressJS configuration and routing.
const app = express();
app.use(express.static(path.join(__dirname, "..", "..", "shared", "static")));
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("html", mustacheExpress());
app.set("view engine", "html");
app.set("views", path.join(__dirname, "..", "..", "shared", "views"));
app.get("/checkout", (req, res) => res.render("checkout.html", staticParams));
app.get("/manageAccount", (req, res) => res.render("manageAccount.html", staticParams));
app.post("/rest/charge", charge);
app.post("/rest/simulate", simulate);
app.post("/rest/createAccount", createAccount);
app.post("/rest/creditAccount", creditAccount);
app.listen((+process.env.HTTP_PORT) || 3000, () => console.log("Lightrail demo running on http://localhost:3000"));
