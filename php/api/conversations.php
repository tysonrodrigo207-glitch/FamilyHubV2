<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

if (!isset($_SESSION["user"])) {
    echo json_encode([
        "success" => false,
        "message" => "Not logged in"
    ]);
    exit;
}

$userId = $_SESSION["user"]["id"];

$sql = "

SELECT

c.id,

CASE
WHEN c.type='direct' THEN (
SELECT u.full_name
FROM conversation_members cm2
JOIN users u ON u.id=cm2.user_id
WHERE cm2.conversation_id=c.id
AND u.id<>?
LIMIT 1
)
ELSE c.name
END AS name,

c.type,

(
SELECT message
FROM messages
WHERE conversation_id=c.id
ORDER BY id DESC
LIMIT 1
) AS last_message,

(
SELECT sent_at
FROM messages
WHERE conversation_id=c.id
ORDER BY id DESC
LIMIT 1
) AS last_time,

(
SELECT COUNT(*)
FROM messages
WHERE conversation_id=c.id
AND id >
COALESCE(
(
SELECT last_read_message
FROM conversation_members
WHERE conversation_id=c.id
AND user_id=?
),
0
)
) AS unread_count

FROM conversations c

JOIN conversation_members me
ON me.conversation_id = c.id

WHERE me.user_id = ?

ORDER BY last_time DESC, c.created_at DESC

";

$stmt = $conn->prepare("
UPDATE users
SET last_seen = NOW()
WHERE id = ?
");

$stmt->bind_param("i", $userId);
$stmt->execute();

$stmt = $conn->prepare($sql);

$stmt->bind_param("iii",
$userId,
$userId,
$userId
);

$stmt->execute();

$result = $stmt->get_result();

$conversations = [];

while ($row = $result->fetch_assoc()) {

    $conversations[] = $row;

}

echo json_encode([
    "success" => true,
    "data" => $conversations
]);