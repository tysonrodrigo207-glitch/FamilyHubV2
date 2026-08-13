<?php

session_start();
header("Content-Type: application/json");

require_once "../config/database.php";

$user=$_SESSION["user"]["id"];

$event=(int)$_POST["event_id"];

$check=$conn->prepare("

SELECT id
FROM attendees
WHERE
event_id=?
AND user_id=?

");

$check->bind_param(
"ii",
$event,
$user
);

$check->execute();

if(!$check->get_result()->num_rows){

$insert=$conn->prepare("

INSERT INTO attendees
(event_id,user_id)

VALUES(?,?)

");

$insert->bind_param(
"ii",
$event,
$user
);

$insert->execute();

}

echo json_encode([
"success"=>true
]);