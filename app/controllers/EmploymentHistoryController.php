<?php

class EmploymentHistoryController extends Controller
{
    public function index(int $employeeId): void
    {
        $rows = $this->db->query(
            "SELECT eh.*, d.name AS department, jt.name AS job_title
             FROM employment_histories eh
             LEFT JOIN departments d ON eh.department_id = d.id
             LEFT JOIN job_titles jt ON eh.job_title_id = jt.id
             WHERE eh.employee_id = ?
             ORDER BY eh.start_date DESC",
            [$employeeId]
        )->fetchAll();
        Response::json($rows);
    }

    public function store(int $employeeId): void
    {
        $d = $this->request->json();
        $this->db->query(
            "INSERT INTO employment_histories (
                employee_id, department_id, job_title_id, start_date, end_date, salary,
                work_location, employment_type, employment_status, report_to, created_at, updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                $employeeId,
                $d['department_id'] ?? null,
                $d['job_title_id'] ?? null,
                $d['start_date'] ?? date('Y-m-d'),
                $d['end_date'] ?? null,
                $d['salary'] ?? null,
                $d['work_location'] ?? null,
                $d['employment_type'] ?? null,
                $d['employment_status'] ?? 'active',
                $d['report_to'] ?? null,
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
            ]
        );
        Response::json(['id' => $this->db->lastId()], 201);
    }
}
