<?php

$db = $GLOBALS['db'] ?? null;

// Auth
$router->post('/api/login', [AuthController::class, 'login']);

// Health / home
$router->get('/', function () {
    Response::json(['message' => 'HRM API ready']);
});
$router->get('/api/health', function () use ($db) {
    $dbStatus = 'ok';

    try {
        $db->query('SELECT 1');
    } catch (Throwable $e) {
        $dbStatus = 'error';
    }

    $payload = [
        'service' => 'hrm-api',
        'time'    => (new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')))->format(DATE_ATOM),
        'db'      => $dbStatus,
    ];

    $code = $dbStatus === 'ok' ? 200 : 500;
    Response::json($payload, $code);
});
$router->post('/api/health', function () use ($db) {
    $dbStatus = 'ok';

    try {
        $db->query('SELECT 1');
    } catch (Throwable $e) {
        $dbStatus = 'error';
    }

    $payload = [
        'service' => 'hrm-api',
        'time'    => (new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')))->format(DATE_ATOM),
        'db'      => $dbStatus,
    ];

    $code = $dbStatus === 'ok' ? 200 : 500;
    Response::json($payload, $code);
});

// Roles & Users
$router->get('/api/roles', [RoleController::class, 'index'])->middleware('auth', 'perm:P002');
$router->get('/api/users', [UserController::class, 'index'])->middleware('auth', 'perm:P001,P002');
$router->post('/api/users', [UserController::class, 'store'])->middleware('auth', 'perm:P001,P002');
$router->patch('/api/users/{id}', [UserController::class, 'update'])->middleware('auth', 'perm:P001,P002');
$router->delete('/api/users/{id}', [UserController::class, 'destroy'])->middleware('auth', 'perm:P001');

// Employees
$router->get('/api/employees', [EmployeeController::class, 'index'])
    ->middleware('auth', 'perm:P003');
$router->get('/api/employees/{id}', [EmployeeController::class, 'show'])
    ->middleware('auth', 'perm:P003');
$router->post('/api/employees', [EmployeeController::class, 'store'])
    ->middleware('auth', 'perm:P004');
$router->patch('/api/employees/{id}', [EmployeeController::class, 'update'])
    ->middleware('auth', 'perm:P004');
$router->delete('/api/employees/{id}', function (Request $request, array $params) use ($db) {
    $db->query("DELETE FROM employees WHERE id = ?", [$params['id']]);
    Response::json(['deleted' => $params['id']]);
})->middleware('auth', 'perm:P004');

$router->get('/api/employees/{id}/histories', [EmploymentHistoryController::class, 'index'])
    ->middleware('auth', 'perm:P003');
$router->post('/api/employees/{id}/histories', [EmploymentHistoryController::class, 'store'])
    ->middleware('auth', 'perm:P004');

// Departments
$router->get('/api/departments', [DepartmentController::class, 'index'])->middleware('auth', 'perm:P003');
$router->get('/api/departments/{id}', [DepartmentController::class, 'show'])->middleware('auth', 'perm:P003');
$router->post('/api/departments', [DepartmentController::class, 'store'])->middleware('auth', 'perm:P004');
$router->patch('/api/departments/{id}', [DepartmentController::class, 'update'])->middleware('auth', 'perm:P004');
$router->delete('/api/departments/{id}', [DepartmentController::class, 'destroy'])->middleware('auth', 'perm:P004');

// Job Families
$router->get('/api/job-families', [JobFamilyController::class, 'index'])->middleware('auth', 'perm:P003');
$router->post('/api/job-families', [JobFamilyController::class, 'store'])->middleware('auth', 'perm:P004');
$router->patch('/api/job-families/{id}', [JobFamilyController::class, 'update'])->middleware('auth', 'perm:P004');
$router->delete('/api/job-families/{id}', [JobFamilyController::class, 'destroy'])->middleware('auth', 'perm:P004');

// Job Titles
$router->get('/api/job-titles', [JobTitleController::class, 'index'])->middleware('auth', 'perm:P003');
$router->post('/api/job-titles', [JobTitleController::class, 'store'])->middleware('auth', 'perm:P004');
$router->patch('/api/job-titles/{id}', [JobTitleController::class, 'update'])->middleware('auth', 'perm:P004');
$router->delete('/api/job-titles/{id}', [JobTitleController::class, 'destroy'])->middleware('auth', 'perm:P004');

// Leave types
$router->get('/api/leave-types', [LeaveTypeController::class, 'index'])->middleware('auth', 'perm:P006');

// Leave balances
$router->get('/api/leave-balances/{employeeId}', [LeaveBalanceController::class, 'show'])->middleware('auth', 'perm:P006');

// Leave requests
$router->get('/api/leave-requests', [LeaveRequestController::class, 'index'])->middleware('auth', 'perm:P006');
$router->post('/api/leave-requests', [LeaveRequestController::class, 'store'])->middleware('auth', 'perm:P006');
$router->patch('/api/leave-requests/{id}', [LeaveRequestController::class, 'update'])->middleware('auth', 'perm:P005');

// Work Shifts
$router->get('/api/work-shifts', [WorkShiftController::class, 'index'])->middleware('auth', 'perm:P012');
$router->post('/api/work-shifts', [WorkShiftController::class, 'store'])->middleware('auth', 'perm:P012');
$router->patch('/api/work-shifts/{id}', [WorkShiftController::class, 'update'])->middleware('auth', 'perm:P012');
$router->delete('/api/work-shifts/{id}', [WorkShiftController::class, 'destroy'])->middleware('auth', 'perm:P012');

// Work Schedules
$router->get('/api/work-schedules', [WorkScheduleController::class, 'index'])->middleware('auth', 'perm:P009,P012');
$router->post('/api/work-schedules', [WorkScheduleController::class, 'store'])->middleware('auth', 'perm:P012');
$router->patch('/api/work-schedules/{id}', [WorkScheduleController::class, 'update'])->middleware('auth', 'perm:P012');
$router->delete('/api/work-schedules/{id}', [WorkScheduleController::class, 'destroy'])->middleware('auth', 'perm:P012');

// Attendance
$router->get('/api/attendance', [AttendanceController::class, 'index'])->middleware('auth', 'perm:P009');
$router->post('/api/attendance/checkin', [AttendanceController::class, 'checkin'])->middleware('auth', 'perm:P009');
$router->post('/api/attendance/checkout', [AttendanceController::class, 'checkout'])->middleware('auth', 'perm:P009');
$router->patch('/api/attendance/{id}', [AttendanceController::class, 'update'])->middleware('auth', 'perm:P010');

// Salary components
$router->get('/api/salary-components', [SalaryComponentController::class, 'index'])->middleware('auth', 'perm:P007');
$router->post('/api/salary-components', [SalaryComponentController::class, 'store'])->middleware('auth', 'perm:P008');
$router->patch('/api/salary-components/{id}', [SalaryComponentController::class, 'update'])->middleware('auth', 'perm:P008');
$router->delete('/api/salary-components/{id}', [SalaryComponentController::class, 'destroy'])->middleware('auth', 'perm:P008');

// Employee salary config
$router->get('/api/employees/{employeeId}/salaries', [EmployeeSalaryController::class, 'index'])->middleware('auth', 'perm:P007');
$router->post('/api/employees/{employeeId}/salaries', [EmployeeSalaryController::class, 'store'])->middleware('auth', 'perm:P008');
$router->patch('/api/employees/{employeeId}/salaries/{id}', [EmployeeSalaryController::class, 'update'])->middleware('auth', 'perm:P008');
$router->delete('/api/employees/{employeeId}/salaries/{id}', [EmployeeSalaryController::class, 'destroy'])->middleware('auth', 'perm:P008');

// Activity logs
$router->get('/api/activity-logs', [ActivityLogController::class, 'index'])->middleware('auth', 'perm:P011');
