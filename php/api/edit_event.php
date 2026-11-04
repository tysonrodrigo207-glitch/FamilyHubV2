<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));

}

$id = (int)$_POST["id"];

$title = trim($_POST["title"]);

$description = trim($_POST["description"]);

$location = trim($_POST["location"]);

$stmt = $conn->prepare("

UPDATE events

SET

title=?,

description=?,

location=?

WHERE id=?

");

$stmt->bind_param(

"sssi",

$title,

$description,

$location,

$id

);

$stmt->execute();

echo json_encode([

"success"=>true

]);