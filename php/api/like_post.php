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

$userId=$_SESSION["user"]["id"];

$check=$conn->prepare(

"SELECT id FROM post_likes
WHERE post_id=? AND user_id=?"

);

$check->bind_param("ii",$postId,$userId);

$check->execute();

$result=$check->get_result();

if($result->num_rows){

    $delete=$conn->prepare(

    "DELETE FROM post_likes
    WHERE post_id=? AND user_id=?"

    );

    $delete->bind_param("ii",$postId,$userId);

    $delete->execute();

}else{

    $insert=$conn->prepare(

    "INSERT INTO post_likes(post_id,user_id)
    VALUES(?,?)"

    );

    $insert->bind_param("ii",$postId,$userId);

    if(!$insert->execute()){

    echo json_encode([
        "success"=>false,
        "error"=>$insert->error
    ]);

    exit();

}

}

echo json_encode([
    "success" => true,
    "post_id" => $postId,
    "user_id" => $userId,
    "insert_error" => $conn->error
]);