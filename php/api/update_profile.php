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
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "The profile image could not be uploaded."
        ]);
        exit;
    }

    $allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    if (!in_array($mime, $allowedTypes, true)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Only JPG, PNG, WebP, and GIF images are allowed."
        ]);
        exit;
    }

    if ($file["size"] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Profile pictures must be 2MB or smaller."
        ]);
        exit;
    }

    $uploadDir = dirname(__DIR__, 2) . "/uploads/profile";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $extension = pathinfo($file["name"], PATHINFO_EXTENSION);
    $safeExtension = strtolower($extension ?: "png");
    $filename = "profile_" . $userId . "_" . time() . "." . $safeExtension;
    $destination = $uploadDir . "/" . $filename;

    if (!move_uploaded_file($file["tmp_name"], $destination)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to save the uploaded image."
        ]);
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
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare the profile update query."
    ]);
    exit;
}

$stmt->bind_param($types, ...$params);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to save your profile."
    ]);
    exit;
}

$_SESSION["user"]["name"] = $fullName;
$_SESSION["user"]["full_name"] = $fullName;
$_SESSION["user"]["bio"] = $bio;
if ($profilePicture !== "") {
    $_SESSION["user"]["profile_picture"] = $profilePicture;
}

$user = $_SESSION["user"];
$user["full_name"] = $fullName;
$user["name"] = $fullName;

if ($profilePicture !== "") {
    $user["profile_picture"] = $profilePicture;
}

if (!isset($user["bio"])) {
    $user["bio"] = $bio;
}

echo json_encode([
    "success" => true,
    "message" => "Profile updated successfully.",
    "user" => $user
]);
