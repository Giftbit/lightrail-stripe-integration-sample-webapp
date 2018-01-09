<?php
require __DIR__ . "/../vendor/autoload.php";

// Load and check config.
$dotenv = new Dotenv\Dotenv(__DIR__ . "/../../shared");
$dotenv->load();
if (!getenv("LIGHTRAIL_API_KEY")
    || !getenv("LIGHTRAIL_SHARED_SECRET")
    || !getenv("STRIPE_API_KEY")
    || !getenv("STRIPE_PUBLISHABLE_KEY")
    || !getenv("TITLE")
    || !getenv("SHOPPER_ID")
    || !getenv("ORDER_TOTAL")) {
    trigger_error("One or more environment variables necessary to run this demo is/are not set.  See README.md on setting these values.", E_USER_WARNING);
}

// Configure the Lightrail library.
\Lightrail\Lightrail::setApiKey(getenv("LIGHTRAIL_API_KEY"));
\Lightrail\Lightrail::setSharedSecret(getenv("LIGHTRAIL_SHARED_SECRET"));

// Configure Stripe.
\Stripe\Stripe::setApiKey(getenv("STRIPE_API_KEY"));

// Configuration for the demo.
$staticParams = array(
    "title" => getenv("TITLE"),
    "orderTotal" => intval(getenv("ORDER_TOTAL")),
    "orderTotalDisplay" => number_format(intval(getenv("ORDER_TOTAL")) / 100, 2),
    "currency" => "USD",
    "stripePublicKey" => getenv("STRIPE_PUBLISHABLE_KEY"),
    "shopperId" => getenv("SHOPPER_ID"),
    "shopperToken" => \Lightrail\LightrailShopperTokenFactory::generate(array("shopperId" => getenv("SHOPPER_ID")))
);

$mustache = new Mustache_Engine(array(
    "loader" => new Mustache_Loader_FilesystemLoader(dirname(__FILE__) . "/../../shared/views", array("extension" => ".html"))
));
