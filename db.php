<?php
$host = 'localhost';
$db = 'timewatch_test';
$user = 'root';
$pass = ''; // ברירת מחדל של XAMPP

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass,[PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION]);
    // $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}
?>