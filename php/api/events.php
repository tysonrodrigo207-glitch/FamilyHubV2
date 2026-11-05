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
COALESCE(SUM(CASE WHEN event_rsvp.status = 'Going' THEN 1 ELSE 0 END), 0) AS going_count,
COALESCE(SUM(CASE WHEN event_rsvp.status = 'Interested' THEN 1 ELSE 0 END), 0) AS maybe_count,
COALESCE(SUM(CASE WHEN event_rsvp.status = 'Not Going' THEN 1 ELSE 0 END), 0) AS notgoing_count,
GROUP_CONCAT(DISTINCT CASE WHEN event_rsvp.status = 'Going' THEN attendees.full_name END SEPARATOR '|') AS attendees

FROM events

JOIN users
ON users.id = events.created_by

LEFT JOIN event_rsvp
ON event_rsvp.event_id = events.id

LEFT JOIN users attendees
ON attendees.id = event_rsvp.user_id

GROUP BY events.id, users.full_name

ORDER BY event_date ASC, event_time ASC
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