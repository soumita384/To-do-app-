// Selecting DOM elements
const inputField = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const stopAlarmButton = document.getElementById('stop-alarm-btn');
const todoList = document.getElementById('todo-list');
const taskDate = document.getElementById('task-date');
const taskHour = document.getElementById('task-hour');
const taskMinute = document.getElementById('task-minute');
const taskAmPm = document.getElementById('task-am-pm');
const alarmSound = new Audio('alarm.mp3'); // Ensure this file exists in your directory

let editingTask = null;
let alarmInterval;

// Load tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task by pressing Enter key
inputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Add task when clicking Add Task button
addButton.addEventListener('click', addTask);

// Stop alarm button
stopAlarmButton.addEventListener('click', stopAlarm);

// Function to add or update task
function addTask() {
    const taskText = inputField.value.trim();
    const date = taskDate.value;
    const hour = taskHour.value;
    const minute = taskMinute.value;
    const amPm = taskAmPm.value;

    const currentTime = new Date();
    const taskTime = new Date(`${date} ${hour}:${minute} ${amPm}`);
    if (taskTime < currentTime) {
        alert('You cannot add a task with a past time.');
        return;
    }

    if (taskText !== '' && date && hour && minute && amPm) {
        const time = `${hour}:${minute} ${amPm}`;
        const task = { text: taskText, date, time, completed: false, priority: false };

        if (editingTask) {
            updateTask(task);
        } else {
            createTaskElement(task);
            saveTask(task);
        }

        // Reset input fields
        inputField.value = '';
        setTodayDateTime(); // Set default date and time to current
        editingTask = null;
    }
}

// Function to create task element in DOM
function createTaskElement(task) {
    const listItem = document.createElement('li');
    listItem.className = 'todo-item';

    listItem.innerHTML = `
        <div class="todo-details">
            <span class="task-title">Task ${todoList.childElementCount + 1}: ${task.text}</span>
            <span class="task-time">${task.date} at ${task.time}</span>
        </div>
        <div>
            <button class="edit-btn">✏️</button>
            <button class="check-btn">✔️</button>
            <button class="delete-btn">❌</button>
            <button class="priority-btn">${task.priority ? '🔥' : '☆'}</button>
        </div>
    `;

    // Edit task
    const editButton = listItem.querySelector('.edit-btn');
    editButton.addEventListener('click', () => {
        editTask(task, listItem);
    });

    // Mark task as complete
    const checkButton = listItem.querySelector('.check-btn');
    checkButton.addEventListener('click', () => {
        listItem.querySelector('.task-title').classList.toggle('completed');
        task.completed = !task.completed;  // Toggle task completion
        saveTasks();  // Save updated task state
    });

    // Delete task
    const deleteButton = listItem.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
        deleteTask(listItem, task);
    });

    // Toggle priority
    const priorityButton = listItem.querySelector('.priority-btn');
    priorityButton.addEventListener('click', () => {
        const priorityTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const priorityCount = priorityTasks.filter(t => t.priority).length;

        if (!task.priority && priorityCount >= 3) {
            alert('You can only prioritize up to 3 tasks.');
            return;
        }

        task.priority = !task.priority;
        priorityButton.textContent = task.priority ? '🔥' : '☆';
        saveTasks();  // Save updated tasks state
        loadTasks(); // Reload tasks to reflect sorting
    });

    todoList.appendChild(listItem);
}

// Function to edit task
function editTask(task, listItem) {
    inputField.value = task.text;
    taskDate.value = task.date;
    const [hour, minuteWithAmPm] = task.time.split(':');
    const minute = minuteWithAmPm.split(' ')[0];
    const amPm = minuteWithAmPm.split(' ')[1];

    taskHour.value = hour;
    taskMinute.value = minute;
    taskAmPm.value = amPm;

    editingTask = task;
    listItem.remove(); // Remove task from the list to be updated
}

// Function to update task in the DOM and localStorage
function updateTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.text === editingTask.text && t.date === editingTask.date && t.time === editingTask.time);

    if (taskIndex !== -1) {
        tasks[taskIndex] = task;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }
}

// Function to load tasks from localStorage
function loadTasks() {
    todoList.innerHTML = ''; // Clear existing tasks
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)); // Sort by date and time
    tasks.forEach(task => createTaskElement(task));
    checkDueTasks();
}

// Function to save task in localStorage
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to save all tasks (for state updates)
function saveTasks() {
    const tasks = [];
    todoList.querySelectorAll('.todo-item').forEach(listItem => {
        const taskTitle = listItem.querySelector('.task-title').textContent.replace(/Task \d+: /, '');
        const taskTime = listItem.querySelector('.task-time').textContent.split(' at ');
        const priority = listItem.querySelector('.priority-btn').textContent === '🔥';
        tasks.push({ text: taskTitle, date: taskTime[0], time: taskTime[1], completed: listItem.querySelector('.task-title').classList.contains('completed'), priority });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to delete task
function deleteTask(listItem, task) {
    listItem.remove();
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.text !== task.text || t.date !== task.date || t.time !== task.time);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks(); // Reload tasks to update numbering