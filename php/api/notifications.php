<?php

require_once __DIR__ . "/../config/session.php";
header("Content-Type: application/json");
require_once __DIR__ . "/../config/database.php";

if (!isset($_SESSION["user"])) {
    echo json_encode(["success" => false, "message" => "Please log in."]);
    exit();
}

$userId = (int) $_SESSION["user"]["id"];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST["action"] ?? "";

    if ($action === "mark_all_read") {
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit();
    }

    if ($action === "read") {
        $notificationId = (int) ($_POST["id"] ?? 0);
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $notificationId, $userId);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit();
    }

    if ($action === "delete") {
        $notificationId = (int) ($_POST["id"] ?? 0);
        $stmt = $conn->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $notificationId, $userId);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Unsupported action."]);
    exit();
}

$stmt = $conn->prepare("SELECT id, title, message, is_read AS is_read_value, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $created = new DateTime($row["created_at"], new DateTimeZone("UTC"));
    $created->setTimezone(new DateTimeZone(date_default_timezone_get()));

    $notifications[] = [
        "id" => (int) $row["id"],
        "title" => $row["title"],
        "text" => $row["message"],
        "read" => (bool) $row["is_read_value"],
        "icon" => "🔔",
        "type" => "system",
        "time" => $created->format("M j, g:i A"),
    ];
}

echo json_encode(["success" => true, "notifications" => $notifications]);
