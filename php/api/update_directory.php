<?php

require_once __DIR__ . "/../config/session.php";

header("Content-Type: application/json");

require_once "../config/database.php";

if(!isset($_SESSION["user"])){
    exit(json_encode([
        "success"=>false
    ]));
}

$user=$_SESSION["user"]["id"];

$phone=$_POST["phone"];
$course=$_POST["course"];
$year=$_POST["year_of_study"];
$faculty=$_POST["faculty"];
$skills=$_POST["skills"];
$interests=$_POST["interests"];
$linkedin=$_POST["linkedin"];
$github=$_POST["github"];
$website=$_POST["website"];

$stmt=$conn->prepare("

UPDATE directory_profiles

SET

phone=?,
course=?,
year_of_study=?,
faculty=?,
skills=?,
interests=?,
linkedin=?,
github=?,
website=?

WHERE user_id=?

");

$stmt->bind_param(

"sssssssssi",

$phone,
$course,
$year,
$faculty,
$skills,
$interests,
$linkedin,
$github,
$website,
$user

);

$stmt->execute();

echo json_encode([
"success"=>true
]);