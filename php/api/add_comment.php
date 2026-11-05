<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";
require_once __DIR__ . "/../config/notifications.php";

if(!isset($_SESSION["user"])){

    exit(json_encode([
        "success"=>false
    ]));

}

$postId=(int)$_POST["post_id"];

$comment=trim($_POST["comment"]);

$userId=$_SESSION["user"]["id"];

$stmt=$conn->prepare(

"INSERT INTO comments(post_id,user_id,comment)
VALUES(?,?,?)"

);

$stmt->bind_param(

"iis",

$postId,
$userId,
$comment

);

$stmt->execute();

$stmt = $conn->prepare("SELECT user_id FROM posts WHERE id = ?");
$stmt->bind_param("i", $postId);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows) {
   $postOwner = $result->fetch_assoc();
   $ownerId = (int) ($postOwner["user_id"] ?? 0);

   if ($ownerId > 0 && $ownerId !== $userId) {
       notifyUser($conn, $ownerId, "New comment", "Someone commented on your family post.");
   }
}

echo json_encode([
"success"=>true
]);