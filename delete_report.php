<?php
// filepath: c:\xampp\htdocs\122\delete_report.php
header('Content-Type: application/json');
require 'db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["error" => "Missing report ID"]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM attendance WHERE id = ?");
if ($stmt->execute([$id])) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Failed to delete report"]);
}
?>