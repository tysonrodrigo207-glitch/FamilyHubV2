<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once __DIR__ . "/../config/notifications.php";
if(!isset($_SESSION["user"])){

exit(json_encode([
"success"=>false
]));

}

$user = $_SESSION["user"]["id"];

$event = (int)$_POST["event_id"];

$statusMap = [
    "going" => "Going",
    "maybe" => "Interested",
    "not_going" => "Not Going"
];

$status = $statusMap[$_POST["status"]] ?? "Interested";

$stmt = $conn->prepare("

SELECT id

FROM event_rsvp

WHERE event_id=?

AND user_id=?

");

$stmt->bind_param("ii",$event,$user);

$stmt->execute();

$result = $stmt->get_result();

if($result->num_rows){

$stmt = $conn->prepare("

UPDATE event_rsvp

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

INSERT INTO event_rsvp

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

$ownerQuery = $conn->prepare("SELECT created_by, title FROM events WHERE id = ?");
$ownerQuery->bind_param("i", $event);
$ownerQuery->execute();
$ownerResult = $ownerQuery->get_result();

if ($ownerResult && $ownerResult->num_rows) {
   $eventData = $ownerResult->fetch_assoc();
   $ownerId = (int) ($eventData["created_by"] ?? 0);
   if ($ownerId > 0 && $ownerId !== $user) {
       notifyUser($conn, $ownerId, "Event RSVP", "A family member just responded to your event.");
   }
}

echo json_encode([

"success"=>true

]);