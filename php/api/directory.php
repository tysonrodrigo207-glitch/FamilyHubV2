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
    u.id,
    u.full_name,
    u.role,
    u.profile_picture,
    u.bio,
    u.email
FROM users u
ORDER BY u.full_name ASC
";

$result=$conn->query($sql);

$data=[];

while($row=$result->fetch_assoc()){

    $data[]=$row;

}

echo json_encode([
    "success"=>true,
    "data"=>$data
]);