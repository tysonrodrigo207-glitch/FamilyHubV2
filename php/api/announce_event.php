<?php

session_start();
header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){
    exit(json_encode(["success"=>false]));
}

$title=$_POST["title"];
$date=$_POST["date"];
$location=$_POST["location"];

$content="📅 New Event: {$title}\n📍 {$location}\n📆 {$date}";

$user=$_SESSION["user"]["id"];

$stmt=$conn->prepare("
INSERT INTO posts
(user_id,content)
VALUES(?,?)
");

$stmt->bind_param(
"is",
$user,
$content
);

$stmt->execute();

echo json_encode([
"success"=>true
]);