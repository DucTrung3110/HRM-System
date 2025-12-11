<?php

class EmployeeController extends Controller
{
    public function index(): void
    {
        $employee = new Employee($this->db);
        $rows = $employee->allWithJoins();
        Response::json($rows);
    }

    public function show(int $id): void
    {
        $row = $this->db->query(
            "SELECT 
                e.*,
                d.name AS department,
                jt.name AS job_title,
                eh.start_date,
                eh.employment_status,
                eh.salary
             FROM employees e
             LEFT JOIN employment_histories eh ON eh.id = (
                SELECT eh2.id FROM employment_histories eh2
                WHERE eh2.employee_id = e.id
                ORDER BY eh2.start_date DESC
                LIMIT 1
             )
             LEFT JOIN departments d ON eh.department_id = d.id
             LEFT JOIN job_titles jt ON eh.job_title_id = jt.id
             WHERE e.id = ?",
            [$id]
        )->fetch();
        if (!$row) {
            Response::error('Employee not found', 404);
            return;
        }
        Response::json($row);
    }

    public function store(): void
    {
        $data = $this->request->json();
        $this->db->query("START TRANSACTION");
        $this->db->query(
            "INSERT INTO employees (
                code, user_id, full_name, gender, dob, personal_email, personal_phone,
                emergency_contact_name, emergency_contact_phone, id_number, id_issue_date, id_issue_place,
                tax_number, insurance_number, address, created_at, updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                $data['code'] ?? null,
                $data['user_id'] ?? null,
                $data['full_name'] ?? null,
                $data['gender'] ?? null,
                $data['dob'] ?? null,
                $data['personal_email'] ?? null,
                $data['personal_phone'] ?? null,
                $data['emergency_contact_name'] ?? null,
                $data['emergency_contact_phone'] ?? null,
                $data['id_number'] ?? null,
                $data['id_issue_date'] ?? null,
                $data['id_issue_place'] ?? null,
                $data['tax_number'] ?? null,
                $data['insurance_number'] ?? null,
                $data['address'] ?? null,
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
            ]
        );
        $employeeId = (int) $this->db->lastId();

        if (!empty($data['employment'])) {
            $e = $data['employment'];
            $this->db->query(
                "INSERT INTO employment_histories (
                    employee_id, department_id, job_title_id, start_date, end_date, salary,
                    work_location, employment_type, employment_status, report_to, created_at, updated_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                    $employeeId,
                    $e['department_id'] ?? null,
                    $e['job_title_id'] ?? null,
                    $e['start_date'] ?? date('Y-m-d'),
                    $e['end_date'] ?? null,
                    $e['salary'] ?? null,
                    $e['work_location'] ?? null,
                    $e['employment_type'] ?? null,
                    $e['employment_status'] ?? 'active',
                    $e['report_to'] ?? null,
                    date('Y-m-d H:i:s'),
                    date('Y-m-d H:i:s'),
                ]
            );
        }

        $this->db->query("COMMIT");
        Response::json(['id' => $employeeId], 201);
    }

    public function update(int $id): void
    {
        $data = $this->request->json();
        $current = $this->db->query("SELECT * FROM employees WHERE id = ?", [$id])->fetch();
        if (!$current) {
            Response::error('Employee not found', 404);
            return;
        }
        $this->db->query(
            "UPDATE employees
             SET code = ?, user_id = ?, full_name = ?, gender = ?, dob = ?, personal_email = ?,
                 personal_phone = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
                 id_number = ?, id_issue_date = ?, id_issue_place = ?, tax_number = ?, insurance_number = ?,
                 address = ?, updated_at = ?
             WHERE id = ?",
            [
                $data['code'] ?? $current['code'],
                $data['user_id'] ?? $current['user_id'],
                $data['full_name'] ?? $current['full_name'],
                $data['gender'] ?? $current['gender'],
                $data['dob'] ?? $current['dob'],
                $data['personal_email'] ?? $current['personal_email'],
                $data['personal_phone'] ?? $current['personal_phone'],
                $data['emergency_contact_name'] ?? $current['emergency_contact_name'],
                $data['emergency_contact_phone'] ?? $current['emergency_contact_phone'],
                $data['id_number'] ?? $current['id_number'],
                $data['id_issue_date'] ?? $current['id_issue_date'],
                $data['id_issue_place'] ?? $current['id_issue_place'],
                $data['tax_number'] ?? $current['tax_number'],
                $data['insurance_number'] ?? $current['insurance_number'],
                $data['address'] ?? $current['address'],
                date('Y-m-d H:i:s'),
                $id
            ]
        );

        if (!empty($data['employment'])) {
            $e = $data['employment'];
            $this->db->query(
                "INSERT INTO employment_histories (
                    employee_id, department_id, job_title_id, start_date, end_date, salary,
                    work_location, employment_type, employment_status, report_to, created_at, updated_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                    $id,
                    $e['department_id'] ?? null,
                    $e['job_title_id'] ?? null,
                    $e['start_date'] ?? date('Y-m-d'),
                    $e['end_date'] ?? null,
                    $e['salary'] ?? null,
                    $e['work_location'] ?? null,
                    $e['employment_type'] ?? null,
                    $e['employment_status'] ?? 'active',
                    $e['report_to'] ?? null,
                    date('Y-m-d H:i:s'),
                    date('Y-m-d H:i:s'),
                ]
            );
        }
        Response::json(['id' => $id]);
    }
}
