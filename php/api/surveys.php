<?php

session_start();

require_once "../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| LOGIN CHECK
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);

    exit();
}


/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

$userId = (int) $_SESSION["user"]["id"];

$userRole = $_SESSION["user"]["role"] ?? "Member";


/*
|--------------------------------------------------------------------------
| REQUEST ACTION
|--------------------------------------------------------------------------
|
| Examples:
|
| surveys.php?action=list
| surveys.php?action=create
| surveys.php?action=vote
| surveys.php?action=delete
|
|--------------------------------------------------------------------------
*/

$action = $_GET["action"] ?? "list";


/*
|--------------------------------------------------------------------------
| ADMIN / MODERATOR CHECK
|--------------------------------------------------------------------------
*/

$isAdmin =
    $userRole === "Admin" ||
    $userRole === "Moderator";


/*
|--------------------------------------------------------------------------
| LIST SURVEYS
|--------------------------------------------------------------------------
*/

if ($action === "list") {

    $sql = "
        SELECT
            s.id,
            s.title,
            s.expiry,
            s.created_by,
            s.created_at,
            u.full_name AS creator_name
        FROM surveys s
        LEFT JOIN users u
            ON u.id = s.created_by
        ORDER BY s.created_at DESC
    ";

    $result = $conn->query($sql);

    $surveys = [];


    while ($survey = $result->fetch_assoc()) {

        $surveyId = (int) $survey["id"];


        /*
        |--------------------------------------------------------------------------
        | LOAD OPTIONS
        |--------------------------------------------------------------------------
        */

        $optionStmt = $conn->prepare("
            SELECT
                so.id,
                so.option_text,
                COUNT(sv.id) AS votes
            FROM survey_options so
            LEFT JOIN survey_votes sv
                ON sv.option_id = so.id
                AND sv.survey_id = so.survey_id
            WHERE so.survey_id = ?
            GROUP BY so.id, so.option_text
            ORDER BY so.id ASC
        ");

        $optionStmt->bind_param(
            "i",
            $surveyId
        );

        $optionStmt->execute();

        $optionResult =
            $optionStmt->get_result();


        $options = [];


        while ($option = $optionResult->fetch_assoc()) {

            $options[] = [
                "id" => (int) $option["id"],
                "text" => $option["option_text"],
                "votes" => (int) $option["votes"]
            ];

        }


        $optionStmt->close();


        /*
        |--------------------------------------------------------------------------
        | CHECK WHETHER CURRENT USER HAS VOTED
        |--------------------------------------------------------------------------
        */

        $voteStmt = $conn->prepare("
            SELECT id
            FROM survey_votes
            WHERE survey_id = ?
            AND user_id = ?
            LIMIT 1
        ");

        $voteStmt->bind_param(
            "ii",
            $surveyId,
            $userId
        );

        $voteStmt->execute();

        $voteResult =
            $voteStmt->get_result();


        $hasVoted =
            $voteResult->num_rows > 0;


        $voteStmt->close();


        /*
        |--------------------------------------------------------------------------
        | ADD SURVEY
        |--------------------------------------------------------------------------
        */

        $surveys[] = [

            "id" => $surveyId,

            "title" =>
                $survey["title"],

            "expiry" =>
                $survey["expiry"],

            "createdBy" =>
                $survey["creator_name"] ?? "Unknown",

            "createdAt" =>
                $survey["created_at"],

            "hasVoted" =>
                $hasVoted,

            "options" =>
                $options

        ];

    }


    echo json_encode([
        "success" => true,
        "data" => $surveys
    ]);

    exit();
}


/*
|--------------------------------------------------------------------------
| CREATE SURVEY
|--------------------------------------------------------------------------
*/

if ($action === "create") {

    if (!$isAdmin) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" =>
                "Only administrators and moderators can create surveys."
        ]);

        exit();
    }


    $data =
        json_decode(
            file_get_contents("php://input"),
            true
        );


    $title =
        trim($data["title"] ?? "");


    $expiry =
        trim($data["expiry"] ?? "");


    $options =
        $data["options"] ?? [];


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if ($title === "") {

        echo json_encode([
            "success" => false,
            "message" => "Survey title is required."
        ]);

        exit();
    }


    /*
    |--------------------------------------------------------------------------
    | REMOVE EMPTY OPTIONS
    |--------------------------------------------------------------------------
    */

    $options = array_values(
        array_filter(
            array_map(
                function ($option) {
                    return trim($option);
                },
                $options
            ),
            function ($option) {
                return $option !== "";
            }
        )
    );


    if (count($options) < 2) {

        echo json_encode([
            "success" => false,
            "message" =>
                "A survey must have at least two options."
        ]);

        exit();
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE SURVEY
    |--------------------------------------------------------------------------
    */

    if ($expiry === "") {

        $expiry = null;

    }


    $stmt = $conn->prepare("
        INSERT INTO surveys
        (
            title,
            expiry,
            created_by
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    ");


    $stmt->bind_param(
        "ssi",
        $title,
        $expiry,
        $userId
    );


    $stmt->execute();


    $surveyId =
        $stmt->insert_id;


    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | CREATE OPTIONS
    |--------------------------------------------------------------------------
    */

    $optionStmt = $conn->prepare("
        INSERT INTO survey_options
        (
            survey_id,
            option_text
        )
        VALUES
        (
            ?,
            ?
        )
    ");


    foreach ($options as $optionText) {

        $optionStmt->bind_param(
            "is",
            $surveyId,
            $optionText
        );

        $optionStmt->execute();

    }


    $optionStmt->close();


    echo json_encode([
        "success" => true,
        "message" => "Survey created successfully.",
        "survey_id" => $surveyId
    ]);

    exit();
}


/*
|--------------------------------------------------------------------------
| VOTE
|--------------------------------------------------------------------------
*/

if ($action === "vote") {


    $data =
        json_decode(
            file_get_contents("php://input"),
            true
        );


    $surveyId =
        (int) ($data["survey_id"] ?? 0);


    $optionId =
        (int) ($data["option_id"] ?? 0);


    if (
        $surveyId <= 0 ||
        $optionId <= 0
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid survey or option."
        ]);

        exit();
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK SURVEY
    |--------------------------------------------------------------------------
    */

    $surveyStmt = $conn->prepare("
        SELECT expiry
        FROM surveys
        WHERE id = ?
        LIMIT 1
    ");


    $surveyStmt->bind_param(
        "i",
        $surveyId
    );


    $surveyStmt->execute();


    $surveyResult =
        $surveyStmt->get_result();


    if ($surveyResult->num_rows === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Survey not found."
        ]);

        exit();
    }


    $survey =
        $surveyResult->fetch_assoc();


    $surveyStmt->close();


    /*
    |--------------------------------------------------------------------------
    | CHECK EXPIRY
    |--------------------------------------------------------------------------
    */

    if (
        !empty($survey["expiry"]) &&
        strtotime($survey["expiry"]) < strtotime(date("Y-m-d"))
    ) {

        echo json_encode([
            "success" => false,
            "message" => "This survey has expired."
        ]);

        exit();
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK OPTION BELONGS TO SURVEY
    |--------------------------------------------------------------------------
    */

    $optionStmt = $conn->prepare("
        SELECT id
        FROM survey_options
        WHERE id = ?
        AND survey_id = ?
        LIMIT 1
    ");


    $optionStmt->bind_param(
        "ii",
        $optionId,
        $surveyId
    );


    $optionStmt->execute();


    $optionResult =
        $optionStmt->get_result();


    if ($optionResult->num_rows === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid survey option."
        ]);

        exit();
    }


    $optionStmt->close();


    /*
    |--------------------------------------------------------------------------
    | CHECK WHETHER USER ALREADY VOTED
    |--------------------------------------------------------------------------
    */

    $checkStmt = $conn->prepare("
        SELECT id
        FROM survey_votes
        WHERE survey_id = ?
        AND user_id = ?
        LIMIT 1
    ");


    $checkStmt->bind_param(
        "ii",
        $surveyId,
        $userId
    );


    $checkStmt->execute();


    $checkResult =
        $checkStmt->get_result();


    if ($checkResult->num_rows > 0) {

        echo json_encode([
            "success" => false,
            "message" =>
                "You have already voted in this survey."
        ]);

        exit();
    }


    $checkStmt->close();


    /*
    |--------------------------------------------------------------------------
    | SAVE VOTE
    |--------------------------------------------------------------------------
    */

    $voteStmt = $conn->prepare("
        INSERT INTO survey_votes
        (
            survey_id,
            option_id,
            user_id
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    ");


    $voteStmt->bind_param(
        "iii",
        $surveyId,
        $optionId,
        $userId
    );


    $voteStmt->execute();


    $voteStmt->close();


    echo json_encode([
        "success" => true,
        "message" => "Vote recorded successfully."
    ]);

    exit();
}


/*
|--------------------------------------------------------------------------
| DELETE SURVEY
|--------------------------------------------------------------------------
*/

if ($action === "delete") {


    if (!$isAdmin) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" =>
                "Only administrators and moderators can delete surveys."
        ]);

        exit();
    }


    $data =
        json_decode(
            file_get_contents("php://input"),
            true
        );


    $surveyId =
        (int) ($data["id"] ?? 0);


    if ($surveyId <= 0) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid survey ID."
        ]);

        exit();
    }


    /*
|--------------------------------------------------------------------------
| DELETE SURVEY
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    DELETE FROM surveys
    WHERE id = ?
");

$stmt->bind_param(
    "i",
    $surveyId
);

$stmt->execute();

if ($stmt->affected_rows === 0) {

    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Survey not found."
    ]);

    exit();
}

$stmt->close();

echo json_encode([
    "success" => true,
    "message" => "Survey deleted successfully."
]);

exit();

}