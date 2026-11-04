<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){
    exit(json_encode([
        "success"=>false
    ]));
}

$sql = "

SELECT

events.*,

users.full_name,

SUM(event_attendees.status='going') AS going_count,

SUM(event_attendees.status='maybe') AS maybe_count,

SUM(event_attendees.status='not_going') AS notgoing_count,

GROUP_CONCAT(
DISTINCT
CASE
WHEN event_attendees.status='going'
THEN attendees.full_name
END
SEPARATOR '|'
) AS attendees

FROM events

JOIN users
ON users.id = events.created_by

LEFT JOIN event_attendees
ON event_attendees.event_id = events.id

LEFT JOIN users attendees
ON attendees.id = event_attendees.user_id

GROUP BY events.id

ORDER BY event_date ASC,event_time ASC
";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){

    $data[] = $row;

}

echo json_encode([
    "success"=>true,
    "data"=>$data
]);