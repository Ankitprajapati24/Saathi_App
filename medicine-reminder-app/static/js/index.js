// Load reminders
async function loadReminders() {
    const response = await fetch('/get_reminders');
    const reminders = await response.json();
    const remindersList = document.getElementById('remindersList');
    remindersList.innerHTML = reminders.map(r => `
        <div class="reminder" data-id="${r[0]}">
            <strong>${r[1]}</strong> at <em>${r[2]}</em>
            <button class="btn-edit" onclick="editReminder(${r[0]}, '${r[1]}', '${r[2]}')">Edit</button>
            <button class="btn-delete" onclick="deleteReminder(${r[0]})">Delete</button>
        </div>
    `).join('');
}

// Add new reminder
document.getElementById('scheduleReminder').addEventListener('click', async () => {
    const medicineName = document.getElementById('medicineName').value;
    const reminderTime = document.getElementById('reminderTime').value;

    if (!medicineName || !reminderTime) {
        alert('Please provide all fields.');
        return;
    }

    await fetch('/add_reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName, reminderTime })
    });

    alert('Reminder scheduled!');
    loadReminders();
});

// Edit reminder
async function editReminder(id, oldName, oldTime) {
    const newName = prompt('Enter new medicine name:', oldName);
    const newTime = prompt('Enter new reminder time:', oldTime);

    if (!newName || !newTime) {
        alert('Both fields are required!');
        return;
    }

    await fetch('/update_reminder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, medicineName: newName, reminderTime: newTime })
    });

    alert('Reminder updated!');
    loadReminders();
}

// Delete reminder
async function deleteReminder(id) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    await fetch('/delete_reminder', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });

    alert('Reminder deleted!');
    loadReminders();
}

// Load reminders on page load
document.addEventListener('DOMContentLoaded', loadReminders);
