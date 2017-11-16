var lightrailShareParameterName = 'lightrail-amount';

var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();


var containerDiv = currentScript.parentNode;
var title = currentScript.getAttribute('data-title');
var logo = currentScript.getAttribute('data-logo');
var total = currentScript.getAttribute('data-total');
var currency = currentScript.getAttribute("data-currency").toUpperCase();
var shopperId = currentScript.getAttribute('data-shopperId');

var checkoutEndpoint = currentScript.getAttribute('data-checkout-endpoint');
var simulateEndpoint = currentScript.getAttribute('data-simulate-endpoint');



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
        "    <form action=\"" + checkoutEndpoint + "\" method=\"post\" id=\"payment-form\">\n" +
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

}

