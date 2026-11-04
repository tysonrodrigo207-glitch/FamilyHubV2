<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

exit(json_encode([
"success"=>false
]));

}

$user=$_SESSION["user"]["id"];

$conversation=(int)$_POST["conversation_id"];

$typing=(int)$_POST["typing"];

$stmt=$conn->prepare("

INSERT INTO typing_status
(conversation_id,user_id,is_typing)

VALUES(?,?,?)

ON DUPLICATE KEY UPDATE

is_typing=?,
updated_at=NOW()

");

$stmt->bind_param(

"iiii",

$conversation,

$user,

$typing,

$typing

);

$stmt->execute();

echo json_encode([
"success"=>true
]);