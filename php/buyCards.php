<?php
require_once __DIR__ . "/include/common.php";

$template = $mustache->loadTemplate("buyCards");
echo $template->render($staticParams);
