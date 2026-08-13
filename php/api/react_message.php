<?php

session_start();
header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));

}

$user = $_SESSION["user"]["id"];

$message = (int)$_POST["message_id"];

$reaction = trim($_POST["reaction"]);


/* Already reacted? */

$check = $conn->prepare("
SELECT id
FROM message_reactions
WHERE
message_id=?
AND user_id=?
");

$check->bind_param(
"ii",
$message,
$user
);

$check->execute();

$result = $check->get_result();

if($result->num_rows){

    $update = $conn->prepare("
    UPDATE message_reactions
    SET reaction=?
    WHERE
    message_id=?
    AND user_id=?
    ");

    $update->bind_param(
    "sii",
    $reaction,
    $message,
    $user
    );

    $update->execute();

}else{

    $insert = $conn->prepare("
    INSERT INTO message_reactions
    (message_id,user_id,reaction)
    VALUES(?,?,?)
    ");

    $insert->bind_param(
    "iis",
    $message,
    $user,
    $reaction
    );

    $insert->execute();

}

echo json_encode([
"success"=>true
]);