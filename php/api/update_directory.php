<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");
require_once __DIR__ . "/../config/database.php";

if (!isset($_SESSION["user"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not authenticated."
    ]);
    exit;
}

$userId = (int) $_SESSION["user"]["id"];
$fullName = trim((string) ($_POST["full_name"] ?? $_POST["name"] ?? ""));
$bio = trim((string) ($_POST["bio"] ?? ""));

if ($fullName === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please provide your full name."
    ]);
    exit;
}

$profilePicture = $_SESSION["user"]["profile_picture"] ?? "";

if (isset($_FILES["profile_image"]) && $_FILES["profile_image"]["error"] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES["profile_image"];

    if ($file["error"] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "message" => "Upload failed."]);
        exit;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    $allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!in_array($mime, $allowed, true)) {
        echo json_encode(["success" => false, "message" => "Only image files are allowed."]);
        exit;
    }

    $uploadDir = dirname(__DIR__, 2) . "/uploads/profile";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION) ?: "png");
    $filename = "profile_" . $userId . "_" . time() . "." . $ext;
    if (!move_uploaded_file($file["tmp_name"], $uploadDir . "/" . $filename)) {
        echo json_encode(["success" => false, "message" => "Could not save image."]);
        exit;
    }

    $profilePicture = "uploads/profile/" . $filename;
}

$sql = "UPDATE users SET full_name = ?, bio = ?";
$params = [$fullName, $bio];
$types = "ss";
if ($profilePicture !== "") {
    $sql .= ", profile_picture = ?";
    $params[] = $profilePicture;
    $types .= "s";
}
$sql .= " WHERE id = ?";
$params[] = $userId;
$types .= "i";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();

$_SESSION["user"]["name"] = $fullName;
$_SESSION["user"]["full_name"] = $fullName;
$_SESSION["user"]["bio"] = $bio;
if ($profilePicture !== "") {
    $_SESSION["user"]["profile_picture"] = $profilePicture;
}

echo json_encode([
    "success" => true,
    "user" => $_SESSION["user"]
]);
