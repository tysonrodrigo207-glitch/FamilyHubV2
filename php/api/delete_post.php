<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";

if (!isset($_SESSION["user"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please login."
    ]);

    exit();
}

$id = intval($_POST["id"] ?? 0);

if ($id <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid post."
    ]);

    exit();
}

$stmt = $conn->prepare("DELETE FROM posts WHERE id=?");

$stmt->bind_param("i", $id);

$stmt->execute();

echo json_encode([
    "success" => true
]);