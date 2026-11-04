<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";

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

echo json_encode([
"success"=>true
]);