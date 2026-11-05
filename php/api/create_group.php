<?php
require_once __DIR__ . "/../config/session.php";
header("Content-Type: application/json");
require_once "../config/database.php";

if (!isset($_SESSION["user"])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

$adminId = (int) $_SESSION["user"]["id"];
$role = $_SESSION["user"]["role"] ?? "";
if (strtolower((string) $role) !== "admin") {
    echo json_encode(["success" => false, "message" => "Only the family admin can create groups."]);
    exit;
}

$name = trim($_POST["name"] ?? "");
$membersRaw = $_POST["members"] ?? "[]";
$members = json_decode($membersRaw, true);

if (!$name || !is_array($members) || empty($members)) {
    echo json_encode(["success" => false, "message" => "Group name and at least one member are required."]);
    exit;
}

$memberIds = [];
foreach ($members as $memberId) {
    $memberId = (int) $memberId;
    if ($memberId > 0 && $memberId !== $adminId) {
        $memberIds[] = $memberId;
    }
}

if (empty($memberIds)) {
    echo json_encode(["success" => false, "message" => "Select at least one family member to add."]);
    exit;
}

$conn->begin_transaction();

$stmt = $conn->prepare("INSERT INTO conversations (name, type, created_by) VALUES (?, 'group', ?)");
$stmt->bind_param("si", $name, $adminId);
if (!$stmt->execute()) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Unable to create the group."]);
    exit;
}

$conversationId = $conn->insert_id;

$memberList = array_values(array_unique(array_merge([$adminId], $memberIds)));
$memberStmt = $conn->prepare("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)");
foreach ($memberList as $memberId) {
    $memberStmt->bind_param("ii", $conversationId, $memberId);
    if (!$memberStmt->execute()) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Unable to add group members."]);
        exit;
    }
}

$conn->commit();

echo json_encode([
    "success" => true,
    "conversation_id" => $conversationId,
    "message" => "Group created successfully."
]);
