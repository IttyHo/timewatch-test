<?php
header('Content-Type: application/json');
require 'db.php';

$stmt = $pdo->query("SELECT * FROM attendance ORDER BY report_date DESC, report_time DESC LIMIT 20");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rows);
?>