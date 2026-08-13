<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = trim($data["password"] ?? "");

if ($username === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "Fill in all fields."
    ]);

    exit();
}

$sql = "SELECT * FROM users WHERE username=?";

$stmt = $conn->prepare($sql);

$stmt->bind_param("s", $username);

$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);

    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user["password"])) {

    echo json_encode([
        "success" => false,
        "message" => "Wrong password."
    ]);

    exit();
}

/*
|--------------------------------------------------------------------------
| Store Logged-in User in Session
|--------------------------------------------------------------------------
*/

$_SESSION["user"] = [

    "id" => $user["id"],

    "name" => $user["full_name"],

    "username" => $user["username"],

    "email" => $user["email"],

    "role" => $user["role"]

];

/*
|--------------------------------------------------------------------------
| Return Login Success
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "user" => $_SESSION["user"]

]);

exit();