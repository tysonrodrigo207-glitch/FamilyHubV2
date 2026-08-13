<?php

header("Content-Type: application/json");

function success($data = [])
{
    echo json_encode([
        "success" => true,
        "data" => $data
    ]);

    exit;
}

function error($message)
{
    echo json_encode([
        "success" => false,
        "message" => $message
    ]);

    exit;
}