const lightrail = require("lightrail-client");

// Of course you would use an MVC or templating library.
// We're just going to use simple (and exploitable) string injection here.

exports.getCheckoutView = function (stripePublicKey, orderTotal, orderCurrency, shopperId) {
    // This token allows the shopper to make a limited set of API calls dynamically from their browser.
    const lightrailToken = lightrail.generateShopperToken({shopperId: shopperId});

    return `
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
};

exports.getCheckoutCompleteView = function (splitTenderCharge) {
    const lightrailTransactionValue = splitTenderCharge.lightrailTransaction ? splitTenderCharge.lightrailTransaction.value / -100 : 0;
    const stripeChargeValue = splitTenderCharge.stripeCharge ? splitTenderCharge.stripeCharge.amount / 100 : 0;

    return `
    <html>
    <table>
        <tr>
            <td>Account credit charged</td>
            <td>$ ${lightrailTransactionValue}</td> 
        </tr>
        <tr>
            <td>Credit card charged</td>
            <td>$ ${stripeChargeValue}</td> 
        </tr>
    </table>
    </html>
    `
};
