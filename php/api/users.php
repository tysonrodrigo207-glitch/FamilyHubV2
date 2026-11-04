<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));

}

$result=$conn->query(

"SELECT
id,
full_name,
role,
last_seen
FROM users"

);

$users=[];

while($row=$result->fetch_assoc()){

    $users[]=$row;

}

$stmt = $conn->prepare("
UPDATE users
SET last_seen = NOW()
WHERE id = ?
");

$stmt->bind_param("i", $userId);
$stmt->execute();

echo json_encode([
"success"=>true,
"data"=>$users
]);