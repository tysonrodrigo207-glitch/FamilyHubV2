<?php

require_once "../config/session.php";

session_destroy();

echo json_encode([
    "success" => true
]);