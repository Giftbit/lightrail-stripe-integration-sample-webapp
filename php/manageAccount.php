<?php
require_once __DIR__ . "/include/common.php";

$template = $mustache->loadTemplate("manageAccount");
echo $template->render($staticParams);
