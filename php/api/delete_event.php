<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){
    exit(json_encode(["success"=>false]));
}

$id = (int)$_POST["id"];

$conn->query("
DELETE FROM event_rsvp
WHERE event_id=$id
");

$stmt = $conn->prepare("
DELETE FROM events
WHERE id=?
");

$stmt->bind_param("i",$id);

$stmt->execute();

echo json_encode([
"success"=>true
]);