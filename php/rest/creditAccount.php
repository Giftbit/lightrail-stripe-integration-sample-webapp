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

\Lightrail\Lightrail::setApiKey(getenv("LIGHTRAIL_API_KEY"));
$res = \Lightrail\LightrailAccount::createTransaction(array(
    'shopperId' => $requestBody['shopperId'],
    'value' => intval($requestBody['value']),
    'userSuppliedId' => uniqid(),
    'currency' => $staticParams['currency']
));
echo 'account for shopperId ' . $requestBody['shopperId'] . ' funded by ' . $requestBody['value'];
