<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

if (!isset($_SESSION["user"])) {

    echo json_encode([

        "loggedIn" => false

    ]);

    exit();

}

echo json_encode([

    "loggedIn" => true,

    "user" => $_SESSION["user"]

]);