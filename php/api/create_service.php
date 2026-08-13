<?php

session_start();
header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));

}
$user = $_SESSION["user"]["id"];

$name=$_POST["name"];
$category=$_POST["category"];
$email = $_POST["email"] ?? "";
$website = $_POST["website"] ?? "";
$phone=$_POST["phone"];
$location=$_POST["location"];
$description=$_POST["description"];

$stmt=$conn->prepare("

INSERT INTO services
(
name,
category,
email,
website,
phone,
location,
description,
created_by
)

VALUES
(
?,?,?, ?,?,?,?,?,?
)

");

$stmt->bind_param(

"sssssi",

$name,
$category,
$phone,
$location,
$description,
$user

);

$stmt->execute();

echo json_encode([
"success"=>true
]);