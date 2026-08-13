<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

$conn->set_charset("utf8mb4");
mysqli_set_charset($conn, "utf8mb4");

if (!isset($_SESSION["user"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please login."
    ]);

    exit();
}

$content = trim($_POST["content"] ?? "");

$userId = $_SESSION["user"]["id"];

$mime = mime_content_type($_FILES["media"]["tmp_name"]);

if (str_starts_with($mime, "image/")) {

    $mediaType = "image";

} elseif (str_starts_with($mime, "video/")) {

    $mediaType = "video";

} else {

    $mediaType = "resource";

}
$fileName = "";

if (
    isset($_FILES["media"]) &&
    $_FILES["media"]["error"] == 0
) {

    $folder = "../../uploads/posts/";

    if (!is_dir($folder)) {

        mkdir($folder,0777,true);

    }

    $fileName = basename($_FILES["media"]["name"]);

    $extension = strtolower(
    pathinfo(
        $fileName,
        PATHINFO_EXTENSION
    )
);

if (in_array($extension, ["jpg","jpeg","png","gif","webp"])) {

    $mediaType = "image";

}
elseif (in_array($extension, ["mp4","mov","webm","ogg","avi","mkv"])) {

    $mediaType = "video";

}
else {

    $mediaType = "resource";

}

    $newName =
        time() . "_" . $fileName;

    if(isset($_FILES["media"])){

    if($_FILES["media"]["error"] != UPLOAD_ERR_OK){

        echo json_encode([
            "success"=>false,
            "message"=>"Upload failed. Error code: ".$_FILES["media"]["error"]
        ]);

        exit();

    }

}    

    move_uploaded_file(

        $_FILES["media"]["tmp_name"],

        $folder . $newName

    );

    $media = "uploads/posts/" . $newName;

}

$content = mb_convert_encoding($content, "UTF-8", "UTF-8");
$fileName = isset($fileName)
    ? mb_convert_encoding($fileName, "UTF-8", "UTF-8")
    : "";
$media = mb_convert_encoding($media, "UTF-8", "UTF-8");
$mediaType = mb_convert_encoding($mediaType, "UTF-8", "UTF-8");

$stmt = $conn->prepare(

"INSERT INTO posts
(user_id,content,media,media_type,file_name)
VALUES(?,?,?,?,?)"

);

$stmt->bind_param(
"issss",

$userId,
$content,
$media,
$mediaType,
$fileName

);

if(!$stmt->execute()){

    die(json_encode([
        "error"=>$stmt->error,
        "content"=>$content,
        "media"=>$media,
        "mediaType"=>$mediaType,
        "fileName"=>$fileName
    ]));

}

echo json_encode([
"success"=>true
]);