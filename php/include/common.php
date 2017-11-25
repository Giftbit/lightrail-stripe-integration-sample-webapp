<?php
require __DIR__ . "/../vendor/autoload.php";

// Load and check config.
$dotenv = new Dotenv\Dotenv(__DIR__ . "/../../shared");
$dotenv->load();
if (!getenv("STRIPE_API_KEY")
    || !getenv("LIGHTRAIL_API_KEY")
    || !getenv("STRIPE_PUBLISHABLE_KEY")
    || !getenv("TITLE")
    || !getenv("LOGO")
    || !getenv("SHOPPER_ID")
    || !getenv("ORDER_TOTAL")) {
    trigger_error("One or more environment variables necessary to run this demo is/are not set.  See README.md on setting these values.", E_USER_WARNING);
}

$staticParams = array(
    "title" => getenv("TITLE"),
    "logo" => getenv("LOGO"),
    "orderTotal" => intval(getenv("ORDER_TOTAL")),
    "orderTotalDisplay" => intval(getenv("ORDER_TOTAL")) / 100,
    "currency" => "USD",
    "stripePublicKey" => getenv("STRIPE_PUBLISHABLE_KEY"),
    "shopperId" => getenv("SHOPPER_ID")
);

$mustache = new Mustache_Engine(array(
    "loader" => new Mustache_Loader_FilesystemLoader(dirname(__FILE__) . "/../../shared/views", array("extension" => ".html"))
));
