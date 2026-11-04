<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";


if (!isset($_SESSION["user"])) {

    echo json_encode([
        "success" => false,
        "message" => "You must be logged in."
    ]);

    exit();

}


$userId = (int) $_SESSION["user"]["id"];


$sql = "

SELECT

    services.id,
    services.name,
    services.category,
    services.phone,
    services.email,
    services.website,
    services.location,
    services.description,
    services.rating,
    services.created_by,
    services.created_at

FROM service_favourites

INNER JOIN services

    ON services.id = service_favourites.service_id

WHERE service_favourites.user_id = ?

ORDER BY service_favourites.created_at DESC

";


$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "i",
    $userId
);

$stmt->execute();

$result = $stmt->get_result();


$data = [];


while ($row = $result->fetch_assoc()) {

    $data[] = $row;

}


echo json_encode([

    "success" => true,

    "data" => $data

]);

exit();