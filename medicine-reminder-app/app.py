from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import threading
import time

app = Flask(__name__)
DATABASE = 'medicine_reminders.db'

# Initialize SQLite3 Database
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL,
            reminder_time TEXT NOT NULL
        )''')

# Add a new reminder
@app.route('/add_reminder', methods=['POST'])
def add_reminder():
    data = request.json
    medicine_name = data['medicineName']
    reminder_time = data['reminderTime']
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("INSERT INTO reminders (medicine_name, reminder_time) VALUES (?, ?)", 
                     (medicine_name, reminder_time))
    return jsonify({'status': 'success'})

# Get all reminders
@app.route('/get_reminders', methods=['GET'])
def get_reminders():
    with sqlite3.connect(DATABASE) as conn:
        reminders = conn.execute("SELECT id, medicine_name, reminder_time FROM reminders").fetchall()
    return jsonify(reminders)

# API to check current reminders (called by frontend)
@app.route('/check_reminders', methods=['GET'])
def check_reminders():
    now = datetime.now().strftime("%H:%M")
    with sqlite3.connect(DATABASE) as conn:
        reminders = conn.execute("SELECT * FROM reminders WHERE reminder_time = ?", (now,)).fetchall()
    return jsonify(reminders)

# Update a reminder (UPDATE)
@app.route('/update_reminder', methods=['PUT'])
def update_reminder():
    data = request.json
    reminder_id = data['id']
    medicine_name = data['medicineName']
    reminder_time = data['reminderTime']
    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            "UPDATE reminders SET medicine_name = ?, reminder_time = ? WHERE id = ?",
            (medicine_name, reminder_time, reminder_id)
        )
    return jsonify({'status': 'success'})

# Delete a reminder (DELETE)
@app.route('/delete_reminder', methods=['DELETE'])
def delete_reminder():
    data = request.json
    reminder_id = data['id']
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
    return jsonify({'status': 'success'})


# Render the main page
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
