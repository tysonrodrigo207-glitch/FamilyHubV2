<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once __DIR__ . "/../config/database.php";

$data = json_decode(file_get_contents("php://input"), true) ?? [];

$fullName = trim((string) ($data["full_name"] ?? $data["fullName"] ?? ""));
$username = trim((string) ($data["username"] ?? ""));
$email = trim(strtolower((string) ($data["email"] ?? "")));
$password = (string) ($data["password"] ?? "");
$requestedRole = trim((string) ($data["role"] ?? "Member"));

if ($fullName === "" || $username === "" || $email === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all fields."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters long."
    ]);
    exit;
}

$allowedRoles = ["Admin", "Moderator", "Member"];
$role = "Member";

if (isset($_SESSION["user"]) && $_SESSION["user"]["role"] === "Admin" && in_array($requestedRole, $allowedRoles, true)) {
    $role = $requestedRole;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "An account with that username or email already exists."
    ]);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "INSERT INTO users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("sssss", $fullName, $username, $email, $passwordHash, $role);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to create your account right now."
    ]);
    exit;
}

$userId = $conn->insert_id;

$_SESSION["user"] = [
    "id" => $userId,
    "name" => $fullName,
    "username" => $username,
    "email" => $email,
    "role" => $role
];

echo json_encode([
    "success" => true,
    "message" => "Account created successfully.",
    "user" => $_SESSION["user"]
]);