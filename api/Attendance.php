<?php
class Attendance {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function fetchReports() {
        $stmt = $this->pdo->query("SELECT * FROM attendance ORDER BY report_date DESC, report_time DESC LIMIT 20");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addReport($type, $date, $time) {
        // בדיקה אם הדיווח חופף לטווחי זמן קיימים
        if ($this->isOverlappingReport($date, $time)) {
            return ['error' => 'הדיווח חופף לטווח זמן קיים'];
        }

        // הוספת הדיווח למסד הנתונים
        $stmt = $this->pdo->prepare("INSERT INTO attendance (report_type, report_date, report_time) VALUES (?, ?, ?)");
        $stmt->execute([$type, $date, $time]);
        return ['success' => true];
    }

    public function deleteReport($id) {
        $stmt = $this->pdo->prepare("DELETE FROM attendance WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function calculateMonthlyHours($month) {
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        $stmt = $this->pdo->prepare("
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
                $totalHours += ($lastOut - $lastIn) / 3600;
                $lastIn = null;
            }
        }

        return round($totalHours, 2);
    }

    public function isOverlappingReport($date, $time) {
        $stmt = $this->pdo->prepare("
            SELECT report_type, report_date, report_time 
            FROM attendance 
            WHERE report_date = ?
            ORDER BY report_time
        ");
        $stmt->execute([$date]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $lastIn = null;
        foreach ($rows as $row) {
            $currentTime = strtotime($row['report_date'] . ' ' . $row['report_time']);
            if ($row['report_type'] === 'in') {
                $lastIn = $currentTime;
            } elseif ($row['report_type'] === 'out' && $lastIn) {
                $lastOut = $currentTime;

                // בדיקה אם הזמן החדש נמצא בתוך הטווח
                $newTime = strtotime($date . ' ' . $time);
                if ($newTime >= $lastIn && $newTime <= $lastOut) {
                    return true; // חופף
                }

                $lastIn = null; // איפוס הטווח
            }
        }

        return false; // לא חופף
    }
}
?>