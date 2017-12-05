<?php
require_once __DIR__ . "/../include/common.php";

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
    "lightrailTransactionValue" => number_format($splitTenderCharge->getLightrailShare() / 100, 2),
    "stripeChargeValue" => number_format($splitTenderCharge->getStripeShare() / 100, 2)
));
