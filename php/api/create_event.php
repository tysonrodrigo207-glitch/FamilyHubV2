<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";
require_once __DIR__ . "/../config/notifications.php";
if(!isset($_SESSION["user"])){

exit(json_encode([
"success"=>false
]));

}

$user=$_SESSION["user"]["id"];

$title=$_POST["title"];

$description=$_POST["description"];

$location=$_POST["location"];

$date=$_POST["event_date"];

$time=$_POST["event_time"];

$stmt=$conn->prepare("

INSERT INTO events
(title,description,location,event_date,event_time,created_by)

VALUES(?,?,?,?,?,?)

");

$stmt->bind_param(

"sssssi",

$title,
$description,
$location,
$date,
$time,
$user

);

$stmt->execute();

$content="New Event: {$title}\nLocation: {$location}\nDate: {$date}";

$post=$conn->prepare("
INSERT INTO posts
(user_id,content)
VALUES(?,?)
");

$post->bind_param(
"is",
$user,
$content
);

$post->execute();

broadcastNotification($conn, "New event", "A new family event has been scheduled.", $user);

echo json_encode([
"success"=>true
]);