<?php

if (session_status() === PHP_SESSION_NONE) {
    $isSecureRequest = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") || ($_SERVER["SERVER_PORT"] ?? 80) == 443;

    session_set_cookie_params([
        "lifetime" => 60 * 60 * 8,
        "path" => "/",
        "secure" => $isSecureRequest,
        "httponly" => true,
        "samesite" => "Lax"
    ]);

    session_name("familyhub_session");
    session_start();
}