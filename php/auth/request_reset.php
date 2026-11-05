<?php

require_once __DIR__ . "/../config/session.php";
header("Content-Type: application/json");
require_once __DIR__ . "/../config/database.php";

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$email = trim(strtolower((string) ($data["email"] ?? "")));

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
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

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => true,
        "message" => "If an account exists for this email, a reset code has been generated."
    ]);
    exit;
}

$user = $result->fetch_assoc();
$userId = (int) $user["id"];
$token = bin2hex(random_bytes(24));
$expiresAt = (new DateTimeImmutable("+1 hour"))->format("Y-m-d H:i:s");

$deleteStmt = $conn->prepare("DELETE FROM password_resets WHERE user_id = ?");
$deleteStmt->bind_param("i", $userId);
$deleteStmt->execute();

$stmt = $conn->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $userId, $token, $expiresAt);
$stmt->execute();

$resetLink = "http://127.0.0.1:8000/?reset_token=" . urlencode($token);

echo json_encode([
    "success" => true,
    "message" => "If an account exists for this email, a reset code has been generated.",
    "token" => $token,
    "reset_link" => $resetLink
]);
