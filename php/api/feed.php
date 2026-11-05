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

$userId = (int) $_SESSION["user"]["id"];

$columnCheck = $conn->query("SHOW COLUMNS FROM posts LIKE 'media_type'");
$hasMediaMeta = $columnCheck && $columnCheck->num_rows > 0;

$sql = "
   SELECT
       posts.id,
       posts.content,
       posts.media,
       posts.created_at,
       users.full_name,
       users.role,
       COUNT(DISTINCT post_likes.id) AS likes,
       COUNT(DISTINCT comments.id) AS comments_count,
       MAX(post_likes.user_id = " . (int) $userId . ") AS liked,
       " . ($hasMediaMeta ? "posts.media_type, posts.file_name" : "'' AS media_type, '' AS file_name") . "
   FROM posts
   JOIN users ON users.id = posts.user_id
   LEFT JOIN post_likes ON post_likes.post_id = posts.id
   LEFT JOIN comments ON comments.post_id = posts.id
   GROUP BY posts.id, users.full_name, users.role, posts.content, posts.media, posts.created_at, posts.media_type, posts.file_name
   ORDER BY posts.created_at DESC";

$result = $conn->query($sql);

$posts = [];

while ($row = $result->fetch_assoc()) {
   $comments = [];

   $commentQuery = $conn->prepare(
       "SELECT comments.comment, users.full_name
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC"
   );

   $commentQuery->bind_param("i", $row["id"]);
   $commentQuery->execute();
   $commentResult = $commentQuery->get_result();

   while ($comment = $commentResult->fetch_assoc()) {
       $comments[] = [
           "user" => $comment["full_name"],
           "text" => $comment["comment"],
       ];
   }

   $rawMedia = (string) ($row["media"] ?? "");
   $mediaType = trim((string) ($row["media_type"] ?? ""));
   $fileName = trim((string) ($row["file_name"] ?? ""));

   if ($rawMedia !== "") {
       $mediaItems = array_values(array_filter(array_map("trim", explode(",", $rawMedia))));
       if (count($mediaItems) > 1) {
           $mediaType = "image";
       } elseif ($mediaType === "") {
           $extension = strtolower(pathinfo($mediaItems[0], PATHINFO_EXTENSION));
           if (in_array($extension, ["jpg", "jpeg", "png", "gif", "webp"], true)) {
               $mediaType = "image";
           } elseif (in_array($extension, ["mp4", "mov", "webm", "ogg", "avi", "mkv"], true)) {
               $mediaType = "video";
           } else {
               $mediaType = "resource";
           }
       }
   }

   $posts[] = [
       "id" => (int) $row["id"],
       "author" => $row["full_name"],
       "role" => $row["role"],
       "content" => $row["content"],
       "media" => $rawMedia,
       "media_type" => $mediaType,
       "file_name" => $fileName !== "" ? $fileName : basename($rawMedia),
       "created_at" => $row["created_at"],
       "likes" => (int) $row["likes"],
       "comments" => $comments,
       "liked" => (bool) $row["liked"],
       "comments_count" => (int) $row["comments_count"],
   ];
}

echo json_encode([
   "success" => true,
   "data" => $posts,
]);