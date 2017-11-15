require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const lightrail = require("lightrail-client");
const lightrailStripe = require('lightrail-stripe');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const uuid = require("uuid");

lightrail.configure({
    apiKey: process.env.LIGHTRAIL_API_KEY,
    sharedSecret: process.env.LIGHTRAIL_CLIENT_SECRET
});

const stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;
const orderTotal = 37500;
const orderCurrency = 'USD';
const shopperId = process.env.SHOPPER_ID;
const lightrailToken = lightrail.generateShopperToken({shopperId: shopperId});

const indexTemplate = `
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<!--    <link rel="stylesheet" href="css/style.css"/> -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css"
          integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
    <script src="http://code.jquery.com/jquery-3.2.1.js"
            integrity="sha256-DZAnKJ/6XZ9si04Hgrsxu/8s717jcIzLy3oi35EouyE="
            crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js"
            integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb"
            crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js"
            integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn"
            crossorigin="anonymous"></script>
    <script src="https://js.stripe.com/v3/"></script>
    <title>Avocado Millennium</title>
</head>
<body>
    <div id="payment-summary" class="container">
        <script src="js/stripesample.js"
            data-lightrailToken="${lightrailToken}"
            data-stripePK="${stripePublicKey}"
            data-title="Avocado Millennium"
            data-logo="img/avocado.png"
            data-total="${orderTotal}"
            data-currency="${orderCurrency}"
            data-shopperId="${shopperId}"
            data-checkout-endpoint="charge"
            data-simulate-endpoint="simulate">
        </script>
    </div>
</body>
</html>
`;

function simulate(req, res) {
    console.log('simulating transaction body=', req.body);
    lightrail.contacts.getContactByUserSuppliedId(shopperId)
        .then(contact => {
            if (!contact) {
                throw new Error(`contact not found with shopperId '${shopperId}'`);
            }
            return lightrail.cards.getAccountCardByContactAndCurrency(contact, orderCurrency)
        })
        .then(card => {
            const splitTenderParams = req.body;
            splitTenderParams.userSuppliedId = uuid.v4();
            return lightrail.cards.transactions.simulateTransaction(
                splitTenderParams,
                splitTenderParams.amount,
                stripe
            );
        })
        .then(transaction => {
            res.send(transaction);
        })
        .catch(err => {
            console.error('Error simulating transaction', err);
            res.status(500).send('Internal error');
        });
}

function charge(req, res) {
    console.log('charging body=', req.body);

    const stripeSource = req.body.source;

    const lightrailShare = req.body['lightrail-amount'];
    const stripeShare = orderTotal - lightrailShare;
    if (lightrailShare < 0 || stripeShare < 0) {
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
            res.send(splitTenderCharge);
        })
        .catch(err => {
            console.error('Error creating split tender transaction', err);
            res.status(500).send('Internal error');
        });
}

const app = express();
app.use(express.static('rsc'));
app.use(bodyParser.json());
app.get('/', (req, res) => res.send(indexTemplate));
app.post('/charge', charge);
app.post('/simulate', simulate);
app.listen(3000, () => console.log('Example app listening on port 3000!'));
