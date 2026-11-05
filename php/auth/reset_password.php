<?php

require_once __DIR__ . "/../config/session.php";
header("Content-Type: application/json");
require_once __DIR__ . "/../config/database.php";

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$token = trim((string) ($data["token"] ?? ""));
$password = (string) ($data["password"] ?? "");

if ($token === "" || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Enter a valid reset code and a new password with at least 6 characters."
    ]);
    exit;
}

$conn->query("CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)");

$stmt = $conn->prepare(
    "SELECT user_id, expires_at FROM password_resets WHERE token = ? AND used_at IS NULL LIMIT 1"
);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "This reset code is invalid or has already been used."
    ]);
    exit;
}

$reset = $result->fetch_assoc();
$expiresAt = new DateTime($reset["expires_at"], new DateTimeZone("UTC"));
$now = new DateTime("now", new DateTimeZone("UTC"));

if ($expiresAt < $now) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "This reset code has expired. Please request a new one."
    ]);
    exit;
}

$userId = (int) $reset["user_id"];
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$updateUser = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$updateUser->bind_param("si", $passwordHash, $userId);
$updateUser->execute();

$markUsed = $conn->prepare("UPDATE password_resets SET used_at = NOW() WHERE token = ?");
$markUsed->bind_param("s", $token);
$markUsed->execute();

echo json_encode([
    "success" => true,
    "message" => "Your password has been updated successfully."
]);
