<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

$user=$_SESSION["user"]["id"];

$conversation=(int)$_GET["conversation"];

$stmt=$conn->prepare("

SELECT users.full_name

FROM typing_status

JOIN users
ON users.id=typing_status.user_id

WHERE

conversation_id=?

AND user_id<>?

AND is_typing=1

AND updated_at>DATE_SUB(NOW(),INTERVAL 3 SECOND)

");

$stmt->bind_param(

"ii",

$conversation,

$user

);

$stmt->execute();

$result=$stmt->get_result();

$data=[];

while($row=$result->fetch_assoc()){

$data[]=$row;

}

echo json_encode([
"success"=>true,
"data"=>$data
]);