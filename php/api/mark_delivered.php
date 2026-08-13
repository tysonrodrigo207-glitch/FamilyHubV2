<?php

session_start();
header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])) exit;

$user=$_SESSION["user"]["id"];

$conversation=(int)$_POST["conversation_id"];

$stmt=$conn->prepare("
UPDATE messages
SET delivered=1
WHERE conversation_id=?
AND sender_id<>?
");

$stmt->bind_param(
"ii",
$conversation,
$user
);

$stmt->execute();

echo json_encode([
"success"=>true
]);