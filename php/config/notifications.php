<?php

function notifyUser($conn, $userId, $title, $message) {
    $userId = (int) $userId;

    if ($userId <= 0) {
        return false;
    }

    $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");

    if (!$stmt) {
        return false;
    }

    $stmt->bind_param("iss", $userId, $title, $message);
    $result = $stmt->execute();
    $stmt->close();

    return $result;
}

function notifyUsers($conn, array $userIds, $title, $message) {
    foreach ($userIds as $userId) {
        notifyUser($conn, $userId, $title, $message);
    }
}

function broadcastNotification($conn, $title, $message, $excludeUserId = null) {
    $sql = "SELECT id FROM users";
    $params = [];
    $types = "";

    if ($excludeUserId !== null) {
        $sql .= " WHERE id != ?";
        $params[] = (int) $excludeUserId;
        $types = "i";
    }

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return false;
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        notifyUser($conn, $row["id"], $title, $message);
    }

    $stmt->close();

    return true;
}
