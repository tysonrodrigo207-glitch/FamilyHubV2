<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));
}

$update = $conn->prepare("

UPDATE messages

SET delivered=1

WHERE

conversation_id=?

AND sender_id<>?

");

$update->bind_param(

"ii",

$conversationId,

$userId

);

$update->execute();

$userId = $_SESSION["user"]["id"];

$conversationId = (int)$_GET["conversation"];

$sql = "

SELECT

messages.id,
messages.sender_id,
messages.message,
messages.message_type,
messages.media_url,
messages.sent_at,
messages.delivered,
messages.seen,

users.full_name,
(
SELECT GROUP_CONCAT(
CONCAT(r.reaction, ':', r.total)
SEPARATOR '|'
)
FROM (

SELECT reaction,
COUNT(*) AS total
FROM message_reactions
WHERE message_id = messages.id
GROUP BY reaction

) r

) AS reactions

FROM messages

JOIN users
ON users.id = messages.sender_id

WHERE messages.conversation_id = ?

ORDER BY messages.sent_at ASC

";

$update = $conn->prepare("
UPDATE users
SET last_seen = NOW()
WHERE id = ?
");

$update->bind_param("i",$userId);
$update->execute();

$stmt = $conn->prepare($sql);

$stmt->bind_param("i",$conversationId);

$stmt->execute();

$result = $stmt->get_result();

$data=[];

while($row = $result->fetch_assoc()){

    if(!empty($row["media_url"])){

        $row["media_url"] =
            "/" . ltrim($row["media_url"], "/");

    }

    $data[] = $row;
}

echo json_encode([
    "success"=>true,
    "data"=>$data
]);