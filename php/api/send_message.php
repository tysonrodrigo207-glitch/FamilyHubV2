<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");
require_once __DIR__ . "/../config/notifications.php";
if(!isset($_SESSION["user"])){
    echo json_encode([
        "success"=>false
    ]);
    exit;
}

$conversationId=(int)$_POST["conversation_id"];
$message = trim($_POST["message"]);

if(
    empty($message)
    &&
    isset($_FILES["file"])
){

    $message = $_FILES["file"]["name"];

}
$user=$_SESSION["user"]["id"];

$type = "text";
$media = null;

if(isset($_FILES["file"])){

$file = $_FILES["file"];

$originalName = basename($file["name"]);

$originalName = preg_replace(
    "/[^A-Za-z0-9._-]/",
    "_",
    $originalName
);

$name = time() . "_" . $originalName;

move_uploaded_file(

$file["tmp_name"],

"../../uploads/chat/".$name

);

$media = "uploads/chat/".$name;

$ext = strtolower(
pathinfo($name,PATHINFO_EXTENSION)
);

if(in_array($ext,
["jpg","jpeg","png","gif","webp"])){

$type="image";

}elseif(in_array($ext,
["mp4","mov","avi"])){

$type="video";

}else{

$type="file";

}

}

$insert = $conn->prepare("
INSERT INTO messages
(conversation_id,sender_id,message,message_type,media_url)
VALUES(?,?,?,?,?)
");

$insert->bind_param(
"iisss",
$conversationId,
$user,
$message,
$type,
$media
);

$insert->execute();

$stmt = $conn->prepare("SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?");
$stmt->bind_param("ii", $conversationId, $user);
$stmt->execute();
$members = $stmt->get_result();

while ($member = $members->fetch_assoc()) {
    notifyUser($conn, (int) $member["user_id"], "New message", "You have a new message in the family chat.");
}

$update = $conn->prepare("
UPDATE users
SET last_seen = NOW()
WHERE id = ?
");

$update->bind_param("i",$user);
$update->execute();

echo json_encode([
"success"=>true
]);