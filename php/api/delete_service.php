<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){
    exit(json_encode([
        "success"=>false
    ]));
}

$id=(int)$_POST["id"];

$stmt=$conn->prepare("
DELETE FROM services
WHERE id=?
");

$stmt->bind_param("i",$id);

$stmt->execute();

echo json_encode([
    "success"=>true
]);