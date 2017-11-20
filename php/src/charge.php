<?php
require_once 'test-config.php';
require __DIR__ . '/vendor/autoload.php';

\Lightrail\Lightrail::setApiKey( \Lightrail\TestConfig::$lightrailApiKey );
\Stripe\Stripe::setApiKey( \Lightrail\TestConfig::$stripeApiKey );

//read these parameters from the session or your order or cart object.
$orderTotal    = 37500;
$orderCurrency = 'usd';
$orderId       = uniqid();
$shopperId     = \Lightrail\TestConfig::$shopperId;
////


$token          = $_POST['source'];
$lightrailShare = intval( $_POST['lightrail-amount'] );

if ( $lightrailShare < 0 ) {
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

$stripeShare = $orderTotal - $lightrailShare;


$param = array(
	'amount'          => $orderTotal,
	'currency'        => $orderCurrency,
	'source'          => $token,
	'shopperId'       => $shopperId,
	'idempotency-key' => $orderId
);

$splitTenderCharge = \Lightrail\StripeLightrailSplitTenderCharge::create(
	$param,
	$stripeShare,
	$lightrailShare );

echo '<html>
        <table style=\"width:100%\">
          <tr>
            <td>Account Credit</td>
                <td>$' . ( $splitTenderCharge->getLightrailShare() / 100 ) . '</td> 
            </tr>
            <tr>
                <td>Credit Card</td>
                <td>$' . ( $splitTenderCharge->getStripeShare() / 100 ) . '</td> 
            </tr>
          </table>
        </html>';
