var lightrailShareParameterName = 'lightrail-amount';

var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();


var containerDiv = currentScript.parentNode;
var stripePK = currentScript.getAttribute('data-stripePK');
var title = currentScript.getAttribute('data-title');
var logo = currentScript.getAttribute('data-logo');
var total = currentScript.getAttribute('data-total');
var currency = currentScript.getAttribute("data-currency").toUpperCase();
var shopperId = currentScript.getAttribute('data-shopperId');

var checkoutEndpoint = currentScript.getAttribute('data-checkout-endpoint');
var simulateEndpoint = currentScript.getAttribute('data-simulate-endpoint');


$(document).ready(function () {
    lightrailStuff();
    simulate();
    stripeStuff();
});


function lightrailStuff() {
    var staticContent =
        "<div class=\"row\">\n" +
        "        <div class=\"col\">\n" +
        "            <h2>" + title + "</h2>\n" +
        "        </div>\n" +
        "        <div class=\"col\">\n" +
        "            <image src='" + logo + "'/>\n" +
        "        </div>\n" +
        "</div>\n" +
        "<div class=\"row\">\n" +
        "        <div class=\"col\">\n" +
        "            Order Total\n" +
        "        </div>\n" +
        "        <div id=\"order-total\" class=\"col\">$" + parseInt(total) / 100 +
        "        </div>\n" +
        "</div>\n" +
        "<div class=\"row\">\n" +
        "        <div class=\"col\" for=\"lightrail-share\">Account Credit</div>\n" +
        "        <div class=\"col\" id=\"lightrail-share\"></div>\n" +
        "</div>\n" +
        "<div class=\"row\">\n" +
        "        <div class=\"col\">  <input type=\"checkbox\" id=\"use-acc-cred-checkbox\" checked> <small>Use Account Credit balance to pay for this transaction</small><br></div>\n" +
        "</div>\n" +
        "<div class=\"row\">\n" +
        "        <div class=\"col\" for=\"stripe-share\">Credit Card</div>\n" +
        "        <div class=\"col\" id=\"stripe-share\"></div>\n" +
        "</div>" +
        "<div class=\"container\">\n" +
        "    <form action=\"" + checkoutEndpoint + "\" method=\"post\" id=\"payment-form\" >\n" +
        "        <div class=\"form-row\" id=\"card-element-container\">\n" +
        "            <label for=\"card-element\"></label>\n" +
        "            <div id=\"card-element\">\n" +
        "            </div>\n" +
        "            <div id=\"card-errors\" role=\"alert\"></div>\n" +
        "        </div>\n" +
        "      <input id=\"lightrail-amount\" name=\"" + lightrailShareParameterName + "\" type='hidden'/>" +
        "      <div id=\"lightrail-errors\" role=\"alert\"></div>" +
        "        <button>Pay</button>\n" +
        "    </form>\n" +
        "</div>"
    ;

    $(containerDiv).append(staticContent);
    $('#use-acc-cred-checkbox').change(function () {
        if (this.checked) {
            simulate();
        } else {
            updateSplitPoint(0);
        }
        $('#textbox1').val(this.checked);
    });
}

function simulate() {
    var transaction = {
        shopperId: shopperId,
        currency: currency,
        amount: parseInt(total)
    };
    console.log(JSON.stringify(transaction));
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: simulateEndpoint,
        data: JSON.stringify(transaction),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function (transactionPlan) {
            console.log(JSON.stringify(transactionPlan));
            $("#lightrail-errors").html("");
            var lightrailShare = 0;
            if (transactionPlan) {
                lightrailShare = 0 - transactionPlan.value;
            }
            updateSplitPoint(lightrailShare);
            var stripeShare = total - lightrailShare;
            if (stripeShare === 0) {
                $("#card-element-container").hide();
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            console.log(status);
            console.log(error);
            $("#lightrail-errors").html(xhr.responseText);
        }
    });
}

function updateSplitPoint(lightrailShare) {
    stripeShare = total - lightrailShare;
    $("#lightrail-share").html("$" + (lightrailShare / 100));
    $("#lightrail-amount").val(lightrailShare);
    $("#stripe-share").html("$" + (stripeShare / 100));
}

function stripeStuff() {
    // Create a Stripe client
    var stripe = Stripe(stripePK);

    // Create an instance of Elements
    var elements = stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
        base: {
            color: '#32325d',
            lineHeight: '24px',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

    // Create an instance of the card Element
    var card = elements.create('card', {style: style});

    // Add an instance of the card Element into the `card-element` <div>
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function (event) {
        var displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Handle form submission
    var form = document.getElementById('payment-form');
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (total - parseInt($("#lightrail-amount").val()) > 0) {
            stripe.createToken(card).then(function (result) {
                if (result.error) {
                    // Inform the user if there was an error
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                } else {
                    // Send the token to your server
                    stripeTokenHandler(result.token);
                }
            });
        } else {
            $("#payment-form").submit();
        }
    });
}

function stripeTokenHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    var form = document.getElementById('payment-form');
    var hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'source');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);

    // Submit the form
    form.submit();
}
