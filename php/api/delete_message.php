<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){
    exit(json_encode([
        "success"=>false
    ]));
}

$user = $_SESSION["user"]["id"];

$messageId = (int)$_POST["message_id"];

$stmt = $conn->prepare("
DELETE FROM messages
WHERE id=? AND sender_id=?
");

$stmt->bind_param(
"ii",
$messageId,
$user
);

$stmt->execute();

echo json_encode([
    "success"=>true
]);