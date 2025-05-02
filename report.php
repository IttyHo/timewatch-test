<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$type = $data['report_type'] ?? '';
$date = $data['report_date'] ?? '';
$time = $data['report_time'] ?? '';

if (!$type || !$date || !$time) {
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

// בדיקת חפיפות
$stmt = $pdo->prepare("
    SELECT *
    FROM attendance
    WHERE report_date = ?
    AND (
        (report_type = 'in' AND ? BETWEEN report_time AND (
            SELECT report_time FROM attendance 
            WHERE report_type = 'out' AND report_date = ?
            ORDER BY report_time ASC LIMIT 1
        ))
        OR
        (report_type = 'out' AND ? BETWEEN (
            SELECT report_time FROM attendance 
            WHERE report_type = 'in' AND report_date = ?
            ORDER BY report_time DESC LIMIT 1
        ) AND report_time)
    )
");
$stmt->execute([$date, $time, $date, $time, $date]);

if ($stmt->rowCount() > 0) {
    echo json_encode(["error" => "דיווח חופף קיים"]);
    exit;
}

// הכנסת דיווח חדש
$stmt = $pdo->prepare("INSERT INTO attendance (report_type, report_date, report_time) VALUES (?, ?, ?)");
$stmt->execute([$type, $date, $time]);

echo json_encode(["success" => true]);
?>