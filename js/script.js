function sendReport(type) {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!date || !time) {
        showPopup("יש להזין תאריך ושעה");
        return;
    }

    fetch('api/index.php?action=add_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: type, report_date: date, report_time: time })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showPopup("הדיווח נרשם בהצלחה");
            loadReports();
        } else if (data.error === 'הדיווח חופף לטווח זמן קיים') {
            showPopup("הדיווח חופף לטווח זמן קיים");
        } else {
            showPopup("שגיאה בשליחה");
        }
    })
    .catch(err => {
        console.error(err);
        showPopup("שגיאה בשליחה");
    });
}

function loadReports() {
    fetch('api/index.php?action=fetch_reports')
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById('reportTable').querySelector('tbody');
            table.innerHTML = '';
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

    fetch(`api/index.php?action=delete_report&id=${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showPopup("הדיווח נמחק בהצלחה");
                loadReports();
            } else {
                showPopup("שגיאה במחיקת הדיווח");
            }
        })
        .catch(err => {
            console.error(err);
            showPopup("שגיאה במחיקת הדיווח");
        });
}

function calculateMonthlyHours() {
    const month = document.getElementById('month').value;

    if (!month) {
        showPopup("יש לבחור חודש");
        return;
    }

    fetch(`api/index.php?action=calculate_hours&month=${month}`)
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
    const table = document.getElementById('reportTable');
    const rows = Array.from(table.rows);
    const data = rows.map(row => Array.from(row.cells).map(cell => cell.innerText));

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    XLSX.writeFile(workbook, 'reports.xlsx');
}

window.onload = loadReports;