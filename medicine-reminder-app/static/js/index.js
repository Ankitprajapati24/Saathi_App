// Function to show notifications
const showNotification = (message, type = 'info') => {
    const notificationContainer = document.getElementById('notification-container');

    // Create a notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;

    // Append to the container
    notificationContainer.appendChild(notification);

    // Remove the notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
};

// Load reminders
async function loadReminders() {
    const response = await fetch('/get_reminders');
    const reminders = await response.json();
    const remindersList = document.getElementById('remindersList');
    remindersList.innerHTML = reminders.map(r => `
        <div class="reminder" data-id="${r[0]}">
            <strong>${r[1]}</strong> on <em>${r[2]}</em> at <em>${r[3]}</em>
            <button class="btn-edit" onclick="editReminder(${r[0]}, '${r[1]}', '${r[2]}', '${r[3]}')">Edit</button>
            <button class="btn-delete" onclick="deleteReminder(${r[0]})">Delete</button>
        </div>
    `).join('');
}

// Add new reminder
document.getElementById('scheduleReminder').addEventListener('click', async () => {
    const medicineName = document.getElementById('medicineName').value;
    const reminderDate = document.getElementById('reminderDate').value;
    const reminderTime = document.getElementById('reminderTime').value;

    if (!medicineName || !reminderDate || !reminderTime) {
        showNotification('All fields are required!', 'error');
        return;
    }

    await fetch('/add_reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName, reminderDate, reminderTime })
    });

    showNotification('Reminder scheduled successfully!', 'success');
    loadReminders();
});

// Edit reminder
async function editReminder(id, oldName, oldDate, oldTime) {
    const newName = prompt('Enter new medicine name:', oldName);
    const newDate = prompt('Enter new reminder date (YYYY-MM-DD):', oldDate);
    const newTime = prompt('Enter new reminder time (HH:MM AM/PM):', oldTime);

    if (!newName || !newDate || !newTime) {
        showNotification('All fields are required!', 'error');
        return;
    }

    await fetch('/update_reminder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, medicineName: newName, reminderDate: newDate, reminderTime: newTime })
    });

    showNotification('Reminder updated successfully!', 'success');
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

    showNotification('Reminder deleted successfully!', 'success');
    loadReminders();
}



// Poll reminders for notifications
async function checkReminders() {
    const response = await fetch('/check_reminders');
    const reminders = await response.json();

    reminders.forEach(reminder => {
        showNotification(`Time to take your medicine: ${reminder[1]}`, 'info');
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadReminders();
    setInterval(checkReminders, 60000); // Check every minute
});
