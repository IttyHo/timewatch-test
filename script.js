function sendReport(type) {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!date || !time) {
        showPopup("יש להזין תאריך ושעה");
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
            showPopup("הדיווח נרשם בהצלחה");
            loadReports(); // טען מחדש את הדיווחים
        } else {
            showPopup("שגיאה בשליחה");
        }
    })
    .catch(err => {
        console.error(err);
        showPopup("שגיאה בשליחה");
    });
}

function calculateMonthlyHours() {
    const month = document.getElementById('month').value;

    if (!month) {
        showPopup("יש לבחור חודש");
        return;
    }

    fetch(`calculate_hours.php?month=${month}`)
        .then(res => res.json())
        .then(data => {
            if (data.total_hours !== undefined) {
                document.getElementById('totalHours').innerText = `סך שעות עבודה לחודש ${month}: ${data.total_hours} שעות`;
            } else {
                showPopup("שגיאה בחישוב שעות העבודה");
            }
        })
        .catch(err => {
            console.error(err);
            showPopup("שגיאה בחישוב שעות העבודה");
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
                showPopup("הדיווח נמחק בהצלחה");
                loadReports(); // טען מחדש את הדיווחים
            } else {
                showPopup("שגיאה במחיקת הדיווח");
            }
        })
        .catch(err => {
            console.error(err);
            showPopup("שגיאה במחיקת הדיווח");
        });
}

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.classList.remove('hidden');
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
}

function exportToExcel() {
    // קבלת הטבלה
    const table = document.getElementById('reportTable');
    const rows = Array.from(table.rows);

    const data = rows.map(row => Array.from(row.cells).map(cell => cell.innerText));

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    XLSX.writeFile(workbook, 'reports.xlsx');
}

window.onload = loadReports;
