function sendReport(type) {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!date || !time) {
        alert("יש להזין תאריך ושעה");
        return;
    }

    fetch('report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: type, report_date: date, report_time: time })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("הדיווח נרשם בהצלחה");
            loadReports(); // טען מחדש את הדיווחים
        } else {
            alert(data.error || "שגיאה בשליחה");
        }
    })
    .catch(err => {
        console.error(err);
        alert("שגיאה בשליחה");
    });
}

function calculateMonthlyHours() {
    const month = document.getElementById('month').value;

    if (!month) {
        alert("יש לבחור חודש");
        return;
    }

    fetch(`calculate_hours.php?month=${month}`)
        .then(res => res.json())
        .then(data => {
            if (data.total_hours !== undefined) {
                document.getElementById('totalHours').innerText = `סך שעות עבודה לחודש ${month}: ${data.total_hours} שעות`;
            } else {
                alert("שגיאה בחישוב שעות העבודה");
            }
        })
        .catch(err => {
            console.error(err);
            alert("שגיאה בחישוב שעות העבודה");
        });
}


function loadReports() {
    fetch('fetch_reports.php')
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById('reportTable').querySelector('tbody');
            table.innerHTML = ''; // נקה את הטבלה לפני הוספת נתונים חדשים
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.report_type}</td>
                    <td>${row.report_date}</td>
                    <td>${row.report_time}</td>
                    <td>${row.created_at}</td>
                    <td><button class="btn btn-danger" onclick="deleteReport(${row.id})">מחק</button></td>
                `;
                table.appendChild(tr);
            });
        });
}

function deleteReport(id) {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הדיווח?")) return;

    fetch(`delete_report.php?id=${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("הדיווח נמחק בהצלחה");
                loadReports(); // טען מחדש את הדיווחים
            } else {
                alert(data.error || "שגיאה במחיקת הדיווח");
            }
        })
        .catch(err => {
            console.error(err);
            alert("שגיאה במחיקת הדיווח");
        });
}

// טען את הדיווחים בעת פתיחת העמוד
window.onload = loadReports;
