<?php

require_once __DIR__ . "/../config/session.php";
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

function normalizeUploadedFiles(array $files): array {
   $normalized = [];

   foreach ($files["name"] as $index => $name) {
       if ($name === "") {
           continue;
       }

       $normalized[] = [
           "name" => $name,
           "type" => $files["type"][$index] ?? "",
           "tmp_name" => $files["tmp_name"][$index] ?? "",
           "error" => $files["error"][$index] ?? UPLOAD_ERR_NO_FILE,
           "size" => $files["size"][$index] ?? 0,
       ];
   }

   return $normalized;
}

function detectMediaType(string $fileName, string $mimeType): string {
   $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

   if (str_starts_with($mimeType, "image/") || in_array($extension, ["jpg", "jpeg", "png", "gif", "webp"], true)) {
       return "image";
   }

   if (str_starts_with($mimeType, "video/") || in_array($extension, ["mp4", "mov", "webm", "ogg", "avi", "mkv"], true)) {
       return "video";
   }

   return "resource";
}

$content = trim((string) ($_POST["content"] ?? ""));
$userId = $_SESSION["user"]["id"];

$uploadedFiles = [];
$rawFiles = $_FILES["media"] ?? null;

if (is_array($rawFiles) && isset($rawFiles["name"])) {
   $mediaArray = is_array($rawFiles["name"]) ? normalizeUploadedFiles($rawFiles) : [
       [
           "name" => $rawFiles["name"],
           "type" => $rawFiles["type"] ?? "",
           "tmp_name" => $rawFiles["tmp_name"] ?? "",
           "error" => $rawFiles["error"] ?? UPLOAD_ERR_NO_FILE,
           "size" => $rawFiles["size"] ?? 0,
       ]
   ];

   foreach ($mediaArray as $file) {
       if (!isset($file["tmp_name"]) || !is_string($file["tmp_name"]) || $file["tmp_name"] === "") {
           continue;
       }

       if (!is_uploaded_file($file["tmp_name"]) || (int) $file["error"] !== UPLOAD_ERR_OK) {
           continue;
       }

       $mimeType = mime_content_type($file["tmp_name"]) ?: "";
       $mediaType = detectMediaType((string) $file["name"], $mimeType);

       $folder = __DIR__ . "/../../uploads/posts/";
       if (!is_dir($folder)) {
           mkdir($folder, 0777, true);
       }

       $safeFileName = time() . "_" . preg_replace('/[^A-Za-z0-9._-]+/', '_', basename((string) $file["name"])) ;
       $destination = $folder . $safeFileName;

       if (!move_uploaded_file($file["tmp_name"], $destination)) {
           continue;
       }

       $uploadedFiles[] = [
           "path" => "uploads/posts/" . $safeFileName,
           "type" => $mediaType,
           "file_name" => basename((string) $file["name"]),
       ];
   }
}

if ($content === "" && empty($uploadedFiles)) {
   echo json_encode([
       "success" => false,
       "message" => "Write something before posting."
   ]);
   exit();
}

$mediaValue = "";
$mediaType = "";
$fileNameValue = "";

if (!empty($uploadedFiles)) {
   $paths = array_column($uploadedFiles, "path");
   $mediaValue = count($paths) === 1 ? $paths[0] : implode(",", $paths);
   $mediaType = count($uploadedFiles) > 1 ? "image" : $uploadedFiles[0]["type"];
   $fileNameValue = count($uploadedFiles) === 1 ? $uploadedFiles[0]["file_name"] : implode(",", array_column($uploadedFiles, "file_name"));
}

$content = mb_convert_encoding($content, "UTF-8", "UTF-8");
$mediaValue = mb_convert_encoding($mediaValue, "UTF-8", "UTF-8");
$mediaType = mb_convert_encoding($mediaType, "UTF-8", "UTF-8");
$fileNameValue = mb_convert_encoding($fileNameValue, "UTF-8", "UTF-8");

$stmt = $conn->prepare(
   "INSERT INTO posts (user_id, content, media, media_type, file_name) VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param("issss", $userId, $content, $mediaValue, $mediaType, $fileNameValue);

if (!$stmt->execute()) {
   echo json_encode([
       "success" => false,
       "message" => "Unable to save your post right now.",
       "error" => $stmt->error,
   ]);
   exit();
}

echo json_encode(["success" => true]);