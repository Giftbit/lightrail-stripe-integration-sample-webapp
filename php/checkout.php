<?php
require_once __DIR__ . "/include/common.php";

$template = $mustache->loadTemplate("checkout");
echo $template->render($staticParams);
