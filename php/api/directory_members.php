<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";


if (!isset($_SESSION["user"])) {

    echo json_encode([
        "success" => false,
        "message" => "Not authenticated."
    ]);

    exit();

}


$sql = "

SELECT
    users.id,
    users.full_name,
    users.username,
    users.email,
    users.role,
    users.profile_picture,
    users.bio
FROM users
ORDER BY users.full_name ASC
";


$result = $conn->query($sql);


$data = [];


while ($row = $result->fetch_assoc()) {

    $data[] = $row;

}


echo json_encode([

    "success" => true,

    "data" => $data

]);

exit();