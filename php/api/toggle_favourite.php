<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user"])) {

    echo json_encode([
        "success" => false,
        "message" => "You must be logged in."
    ]);

    exit();

}


$userId = (int) $_SESSION["user"]["id"];


/*
|--------------------------------------------------------------------------
| Service ID
|--------------------------------------------------------------------------
*/

$serviceId = (int) ($_POST["service_id"] ?? 0);


if ($serviceId <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid service."
    ]);

    exit();

}


/*
|--------------------------------------------------------------------------
| Check whether service exists
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "SELECT id FROM services WHERE id = ?"
);

$stmt->bind_param(
    "i",
    $serviceId
);

$stmt->execute();

$result = $stmt->get_result();


if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Service not found."
    ]);

    exit();

}


/*
|--------------------------------------------------------------------------
| Check existing favourite
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "SELECT id
     FROM service_favourites
     WHERE user_id = ?
     AND service_id = ?"
);

$stmt->bind_param(
    "ii",
    $userId,
    $serviceId
);

$stmt->execute();

$result = $stmt->get_result();


/*
|--------------------------------------------------------------------------
| Remove Favourite
|--------------------------------------------------------------------------
*/

if ($result->num_rows > 0) {

    $stmt = $conn->prepare(
        "DELETE FROM service_favourites
         WHERE user_id = ?
         AND service_id = ?"
    );

    $stmt->bind_param(
        "ii",
        $userId,
        $serviceId
    );

    $stmt->execute();


    echo json_encode([
        "success" => true,
        "favourited" => false,
        "message" => "Removed from favourites."
    ]);

    exit();

}


/*
|--------------------------------------------------------------------------
| Add Favourite
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "INSERT INTO service_favourites
     (user_id, service_id)
     VALUES (?, ?)"
);

$stmt->bind_param(
    "ii",
    $userId,
    $serviceId
);

$stmt->execute();


echo json_encode([
    "success" => true,
    "favourited" => true,
    "message" => "Added to favourites."
]);

exit();