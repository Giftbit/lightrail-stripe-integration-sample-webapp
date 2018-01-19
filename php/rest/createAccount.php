<?php
require_once __DIR__ . "/../include/common.php";

// Make sure that it is a POST request.
if (strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0) {
    throw new Exception('Request method must be POST!');
}

// Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if (strcasecmp($contentType, 'application/json') != 0) {
    throw new Exception('Content type must be: application/json');
}

// Receive the RAW post data.
$content = trim(file_get_contents("php://input"));

// Attempt to decode the incoming RAW post data from JSON.
$requestBody = json_decode($content, true);

// If json_decode failed, the JSON is invalid.
if (!is_array($requestBody)) {
    throw new Exception('Received content contained invalid JSON!');
}

$res = \Lightrail\LightrailAccount::createAccountCard(array(
    'shopperId' => $requestBody['shopperId'],
    'userSuppliedId' => 'accountcard-' . $requestBody['shopperId'] . '-' . $staticParams['currency'],
    'currency' => $staticParams['currency'],
    'cardType' => 'ACCOUNT_CARD'
));

header('Content-Type: text/plain');
echo 'account created (or already exists) for shopperId ' . $requestBody['shopperId'];
