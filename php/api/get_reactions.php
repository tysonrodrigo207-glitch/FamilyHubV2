<?php

header("Content-Type: application/json");

require_once "../config/database.php";

$message=(int)$_GET["message"];

$sql="

SELECT

reaction,

COUNT(*) total

FROM message_reactions

WHERE message_id=?

GROUP BY reaction

";

$stmt=$conn->prepare($sql);

$stmt->bind_param("i",$message);

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