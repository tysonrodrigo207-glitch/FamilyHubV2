<?php

require_once __DIR__ . "/../config/session.php";
require_once "../config/database.php";

if(!isset($_SESSION["user"])) exit;

$userId = $_SESSION["user"]["id"];

$stmt = $conn->prepare("
UPDATE users
SET last_seen = NOW()
WHERE id = ?
");

$stmt->bind_param("i",$userId);
$stmt->execute();