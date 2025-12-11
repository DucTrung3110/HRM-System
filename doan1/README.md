# HRM Backend (PHP MVC)

Lightweight PHP 8 MVC backend exposing RESTful JSON APIs for a small HRM system (users, roles, departments, employees, attendance, leave, salary).

## Structure

- `public/` entry point (`index.php`, router bootstrap).
- `config/` DB config.
- `core/` framework primitives (Database, Router, Request, Response, Auth, Model, Controller).
- `app/controllers`, `app/models`, `app/routes.php`.
- `storage/logs/` for logs.
- `.env` for secrets/config.

## Quick start (no Docker)

```bash
composer install
cp .env.example .env   # update DB + JWT_SECRET
php -S localhost:8000 -t public
```

## Sample APIs

- `POST /api/login` {username|email,password} -> {token,user}
- `GET /api/health` -> {service,time,db} (no auth)
- `GET /api/employees` (auth, role HR|Admin|Manager)
- `GET /api/employees/{id}` (auth)
- `POST /api/employees` (auth, HR|Admin)
- `PATCH /api/employees/{id}` (auth, HR|Admin)

Other flows (departments, shifts, schedules, attendance, leave, salary) add controllers + routes similarly.

## Database

- `sql_schema.sql` holds DDL for 16 core tables: users, roles, departments, job_families, job_titles, employees, employment_histories, leave_types, leave_balances, leave_requests, work_shifts, work_schedules, attendance_records, salary_components, employee_salaries, activity_logs.

## Security & responses

- JWT Bearer with `auth` + `role` middleware.
- Password hashing via `password_hash`.
- PDO prepared statements for queries.
- JSON shape `{status, data|error, details}`.
