<?php

function loadDotEnv(string $path): void {
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        if (preg_match('/^\s*[#;]/', $line)) {
            continue;
        }

        [$name, $value] = array_pad(explode("=", $line, 2), 2, "");
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");

        if ($name === "") {
            continue;
        }

        if (!array_key_exists($name, $_ENV) && getenv($name) === false) {
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

function env(string $key, $default = null) {
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

    if ($value === false || $value === null || $value === "") {
        return $default;
    }

    return $value;
}

loadDotEnv(dirname(__DIR__, 2) . "/.env");

$host = env("DB_HOST", "127.0.0.1");
$dbname = env("DB_NAME", "familyhub");
$user = env("DB_USER", "familyhub");
$password = env("DB_PASS", "");
$port = (int) env("DB_PORT", 3306);

$conn = new mysqli(
    $host,
    $user,
    $password,
    $dbname,
    $port
);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Check DB_HOST, DB_NAME, DB_USER, and DB_PASS."
    ]);
    exit;
}

$conn->set_charset("utf8mb4");