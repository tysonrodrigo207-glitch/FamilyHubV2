<?php

require_once __DIR__ . "/../config/session.php";


header("Content-Type: application/json");

require_once "../config/database.php";

if (!isset($_SESSION["user"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);

    exit();
}

$userId = $_SESSION["user"]["id"];

$sql = "


SELECT

posts.*,

users.full_name,

users.role,

COUNT(DISTINCT post_likes.id) AS likes,

COUNT(DISTINCT comments.id) AS comments_count,

MAX(post_likes.user_id=$userId) AS liked

FROM posts

JOIN users
ON users.id=posts.user_id

LEFT JOIN post_likes
ON post_likes.post_id=posts.id

LEFT JOIN comments
ON comments.post_id=posts.id

GROUP BY
posts.id,
users.full_name,
users.role

ORDER BY posts.created_at DESC;";

$result = $conn->query($sql);

$posts = [];

while($row = $result->fetch_assoc()){

    $comments=[];

    $commentQuery=$conn->prepare(

    "SELECT

    comments.comment,

    users.full_name

    FROM comments

    JOIN users
    ON users.id=comments.user_id

    WHERE comments.post_id=?

    ORDER BY comments.created_at ASC"

    );

    $commentQuery->bind_param(
    "i",
    $row["id"]
    );

    $commentQuery->execute();

    $commentResult=
    $commentQuery->get_result();

    while($comment=
    $commentResult->fetch_assoc()){

        $comments[]=[

            "user"=>$comment["full_name"],

            "text"=>$comment["comment"]

        ];

    }

    $mediaType="";

    if($row["media"]){

        $ext=strtolower(
        pathinfo(
        $row["media"],
        PATHINFO_EXTENSION
        ));

        if(in_array($ext,
        ["jpg","jpeg","png","gif","webp"])){

            $mediaType="image";

        }elseif(in_array($ext,
        ["mp4","mov","webm"])){

            $mediaType="video";

        }else{

            $mediaType="resource";

        }

    }

    $posts[]=[

        "id"=>$row["id"],

        "author"=>$row["full_name"],

        "role"=>$row["role"],

        "content"=>$row["content"],

        "media"=>$row["media"],

        "media_type"=>$mediaType,

        "created_at"=>$row["created_at"],

        "likes"=>(int)$row["likes"],

        "comments"=>$comments,

        "liked"=>(bool)$row["liked"],

        "comments_count"=>(int)$row["comments_count"]

    ];

}

echo json_encode([

    "success"=>true,

    "data"=>$posts

]);