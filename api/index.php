<?php
header('Content-Type: application/json');
require_once '../db/db.php';
require_once 'Attendance.php';

$attendance = new Attendance($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'fetch_reports') {
    echo json_encode($attendance->fetchReports());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'add_report') {
    $data = json_decode(file_get_contents("php://input"), true);
    $type = $data['report_type'] ?? '';
    $date = $data['report_date'] ?? '';
    $time = $data['report_time'] ?? '';

    if (!$type || !$date || !$time) {
        echo json_encode(["error" => "Missing parameters"]);
        exit;
    }

    $result = $attendance->addReport($type, $date, $time);
    echo json_encode($result);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $_GET['action'] === 'delete_report') {
    $id = $_GET['id'] ?? 0;
    echo json_encode(['success' => $attendance->deleteReport($id)]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'calculate_hours') {
    $month = $_GET['month'] ?? date('Y-m');
    echo json_encode(['total_hours' => $attendance->calculateMonthlyHours($month)]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
}
?>