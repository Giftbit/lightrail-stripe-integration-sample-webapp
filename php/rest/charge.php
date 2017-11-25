<?php
require_once __DIR__ . "/../include/common.php";

\Lightrail\Lightrail::setApiKey(getenv("LIGHTRAIL_API_KEY"));
\Stripe\Stripe::setApiKey(getenv("STRIPE_API_KEY"));

$orderTotal = $staticParams["orderTotal"];
$orderCurrency = $staticParams["currency"];
$orderId = uniqid();
$shopperId = $staticParams["shopperId"];
$token = $_POST['source'];
$lightrailShare = intval($_POST['lightrail-amount']);

if ($lightrailShare < 0) {
    echo '<html>
			Invalid value for Lightrail\'s share of the transaction.         
        </html>';
    exit;
}

if (!isset($token)) {
    echo '<html>
			Stripe token not found.         
        </html>';
    exit;
}

$param = array(
    'amount' => $orderTotal,
    'currency' => $orderCurrency,
    'source' => $token,
    'shopperId' => $shopperId,
    'userSuppliedId' => $orderId  // idempotency-key?
);

$splitTenderCharge = \LightrailStripe\SplitTenderCharge::create($param, $lightrailShare);

$template = $mustache->loadTemplate("checkoutComplete");
echo $template->render(array(
    "lightrailTransactionValue" => $splitTenderCharge->getLightrailShare() / 100,
    "stripeChargeValue" => $splitTenderCharge->getStripeShare() / 100
));
