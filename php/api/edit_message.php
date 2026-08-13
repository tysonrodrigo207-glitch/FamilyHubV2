<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));

}

$id = (int)$_POST["id"];

$message = trim($_POST["message"]);

$user = $_SESSION["user"]["id"];

$stmt = $conn->prepare("

UPDATE messages

SET message = ?

WHERE id = ?
AND sender_id = ?

");

$stmt->bind_param(

"sii",

$message,

$id,

$user

);

$stmt->execute();

echo json_encode([

"success"=>true

]);