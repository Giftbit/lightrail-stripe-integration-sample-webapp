<?php
require_once __DIR__ . "/include/common.php";

$template = $mustache->loadTemplate("redeem");
echo $template->render($staticParams);
