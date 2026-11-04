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

$event = (int)$_POST["event_id"];

$status = $_POST["status"];

$stmt = $conn->prepare("

SELECT id

FROM event_attendees

WHERE event_id=?

AND user_id=?

");

$stmt->bind_param("ii",$event,$user);

$stmt->execute();

$result = $stmt->get_result();

if($result->num_rows){

$stmt = $conn->prepare("

UPDATE event_attendees

SET status=?

WHERE event_id=?

AND user_id=?

");

$stmt->bind_param(

"sii",

$status,

$event,

$user

);

}else{

$stmt = $conn->prepare("

INSERT INTO event_attendees

(event_id,user_id,status)

VALUES(?,?,?)

");

$stmt->bind_param(

"iis",

$event,

$user,

$status

);

}

$stmt->execute();

echo json_encode([

"success"=>true

]);