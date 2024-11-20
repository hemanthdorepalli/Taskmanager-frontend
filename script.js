const API_URL = 'http://localhost:8000/api/';
let accessToken = localStorage.getItem('accessToken');

// Show login form on page load
if (!accessToken) {
    $('#loginForm').show();
    $('#registrationForm').hide();
    $('#dashboard').hide();
} else {
    loadDashboard();
}

// Login form submission
$('#login-form').submit(function (e) {
    e.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();

    $.ajax({
        url: API_URL + 'login/',
        method: 'POST',
        data: { username, password },
        success: function (data) {
            accessToken = data.access_token; // Store access token from login response
            localStorage.setItem('accessToken', accessToken);
            loadDashboard();
        },
        error: function (error) {
            alert('Invalid credentials!');
        }
    });
});

// Register form submission
$('#register-form').submit(function (e) {
    e.preventDefault();
    const username = $('#reg-username').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();

    $.ajax({
        url: API_URL + 'register/',  // Ensure this URL is correct
        method: 'POST',
        data: { username, email, password },
        success: function (data) {
            alert('Registration successful!');
            $('#register-form')[0].reset();
            $('#registrationForm').hide();
            $('#loginForm').show();
        },
        error: function (error) {
            alert('Error during registration');
            console.error(error);
        }
    });
});

// Show registration form
$('#show-register').click(function () {
    $('#loginForm').hide();
    $('#registrationForm').show();
});

// Show login form
$('#show-login').click(function () {
    $('#registrationForm').hide();
    $('#loginForm').show();
});

// Load dashboard after login
function loadDashboard() {
    $('#loginForm').hide();
    $('#registrationForm').hide();
    $('#dashboard').show();
    loadTasks();
    loadTaskStats();
}

// Logout
$('#logout-btn').click(function () {
    localStorage.removeItem('accessToken');
    location.reload();
});

// Load tasks
function loadTasks() {
    $.ajax({
        url: API_URL + 'tasks/',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        success: function (data) {
            const tasks = data;
            const tasksTable = $('#tasks-table tbody');
            tasksTable.empty();
            tasks.forEach(task => {
                tasksTable.append(`
                    <tr>
                        <td>${task.title}</td>
                        <td>${task.priority}</td>
                        <td>${task.status}</td>
                        <td>${task.deadline}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editTask(${task.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
                        </td>
                    </tr>
                `);
            });

            // Initialize DataTable
            $('#tasks-table').DataTable();
        },
        error: function (error) {
            console.error('Failed to load tasks:', error);
            alert('Failed to load tasks');
        }
    });
}

// Load task statistics
function loadTaskStats() {
    $.ajax({
        url: API_URL + 'tasks/',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        success: function (data) {
            const totalTasks = data.length;
            const completedTasks = data.filter(task => task.status === 'completed').length;
            const pendingTasks = totalTasks - completedTasks;

            $('#total-tasks').text(totalTasks);
            $('#completed-tasks').text(completedTasks);
            $('#pending-tasks').text(pendingTasks);
        },
        error: function (error) {
            console.error('Failed to load task stats:', error);
            alert('Failed to load task stats');
        }
    });
}

// Edit task
function editTask(taskId) {
    $.ajax({
        url: API_URL + 'tasks/' + taskId + '/',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        success: function (data) {
            $('#task-id').val(data.id);
            $('#title').val(data.title);
            $('#description').val(data.description);
            $('#priority').val(data.priority);
            $('#status').val(data.status);
            $('#deadline').val(data.deadline);
            $('#taskModal').modal('show');
        },
        error: function (error) {
            alert('Failed to load task');
        }
    });
}

// Save task
$('#save-task').click(function () {
    const taskId = $('#task-id').val();
    const title = $('#title').val();
    const description = $('#description').val();
    const priority = $('#priority').val();
    const status = $('#status').val();
    const deadline = $('#deadline').val();

    const data = { title, description, priority, status, deadline };

    let method = 'POST';
    let url = API_URL + 'tasks/';
    if (taskId) {
        method = 'PUT';
        url = API_URL + 'tasks/' + taskId + '/';
    }

    $.ajax({
        url: url,
        method: method,
        data: data,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        success: function () {
            $('#taskModal').modal('hide');
            loadTasks();
            loadTaskStats();
        },
        error: function (error) {
            alert('Error saving task');
        }
    });
});

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        $.ajax({
            url: API_URL + 'tasks/' + taskId + '/',
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            success: function () {
                loadTasks();
                loadTaskStats();
            },
            error: function (error) {
                alert('Failed to delete task');
            }
        });
    }
}

// Show task modal for adding new task
$('#new-task-btn').click(function () {
    $('#task-id').val('');
    $('#title').val('');
    $('#description').val('');
    $('#priority').val('low');
    $('#status').val('yet-to-start');
    $('#deadline').val('');
    $('#taskModal').modal('show');
});
