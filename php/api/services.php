<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

$sql = "

SELECT

services.*,

users.full_name

FROM services

LEFT JOIN users

ON users.id=services.created_by

ORDER BY services.id DESC
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