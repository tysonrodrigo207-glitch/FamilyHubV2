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

$conversation = (int)$_POST["conversation_id"];

/* Update last read message */

$conn->query("

UPDATE conversation_members

SET last_read_message=(

SELECT COALESCE(MAX(id),0)

FROM messages

WHERE conversation_id=$conversation

)

WHERE
conversation_id=$conversation
AND user_id=$user

");

/* Mark messages as delivered and seen */

$stmt = $conn->prepare("

UPDATE messages

SET
seen = 1,
delivered = 1

WHERE
conversation_id = ?
AND sender_id <> ?

");

$stmt->bind_param(
"ii",
$conversation,
$user
);

$stmt->execute();

echo json_encode([
"success"=>true
]);