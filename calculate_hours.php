<?php
header('Content-Type: application/json');
require 'db.php';

$month = $_GET['month'] ?? date('Y-m'); // פורמט: YYYY-MM
$startDate = $month . '-01';
$endDate = date('Y-m-t', strtotime($startDate));

$stmt = $pdo->prepare("
    SELECT report_date, report_time, report_type
    FROM attendance
    WHERE report_date BETWEEN ? AND ?
    ORDER BY report_date, report_time
");
$stmt->execute([$startDate, $endDate]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$totalHours = 0;
$lastIn = null;

foreach ($rows as $row) {
    if ($row['report_type'] === 'in') {
        $lastIn = strtotime($row['report_date'] . ' ' . $row['report_time']);
    } elseif ($row['report_type'] === 'out' && $lastIn) {
        $lastOut = strtotime($row['report_date'] . ' ' . $row['report_time']);
        $totalHours += ($lastOut - $lastIn) / 3600; // חישוב שעות
        $lastIn = null;
    }
}

echo json_encode(['total_hours' => round($totalHours, 2)]);
?>