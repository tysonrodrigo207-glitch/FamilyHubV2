<?php

session_start();
header("Content-Type: application/json");
require_once "../config/database.php";

if (!isset($_SESSION["user"])) {
    exit(json_encode(["success"=>false]));
}

$me = $_SESSION["user"]["id"];
$other = (int)$_POST["user_id"];

if ($me == $other) {
    exit(json_encode([
        "success"=>false,
        "message"=>"Invalid user"
    ]));
}

/* Existing conversation */

$sql = "

SELECT c.id

FROM conversations c

JOIN conversation_members cm1
ON cm1.conversation_id=c.id

JOIN conversation_members cm2
ON cm2.conversation_id=c.id

WHERE
c.type='direct'
AND cm1.user_id=?
AND cm2.user_id=?

LIMIT 1

";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii",$me,$other);
$stmt->execute();

$result = $stmt->get_result();

if($row=$result->fetch_assoc()){

    exit(json_encode([
        "success"=>true,
        "conversation_id"=>$row["id"]
    ]));

}

/* Create conversation */

$stmt=$conn->prepare(

"INSERT INTO conversations(type,created_by)
VALUES('direct',?)"

);

$stmt->bind_param("i",$me);
$stmt->execute();

$conversation=$conn->insert_id;

/* Add members */

$stmt=$conn->prepare(

"INSERT INTO conversation_members
(conversation_id,user_id)
VALUES(?,?)"

);

$stmt->bind_param("ii",$conversation,$me);
$stmt->execute();

$stmt->bind_param("ii",$conversation,$other);
$stmt->execute();

echo json_encode([
    "success"=>true,
    "conversation_id"=>$conversation
]);