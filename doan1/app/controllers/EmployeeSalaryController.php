<?php

class EmployeeSalaryController extends Controller
{
    public function index(int $employeeId): void
    {
        $rows = $this->db->query(
            "SELECT es.*, sc.name AS component_name, sc.type
             FROM employee_salaries es
             JOIN salary_components sc ON es.salary_component_id = sc.id
             WHERE es.employee_id = ?
             ORDER BY es.effective_date DESC",
            [$employeeId]
        )->fetchAll();
        Response::json($rows);
    }

    public function store(int $employeeId): void
    {
        $d = $this->request->json();
        $this->db->query(
            "INSERT INTO employee_salaries (employee_id, salary_component_id, amount, effective_date, end_date, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?)",
            [
                $employeeId,
                $d['salary_component_id'] ?? null,
                $d['amount'] ?? null,
                $d['effective_date'] ?? null,
                $d['end_date'] ?? null,
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
            ]
        );
        Response::json(['id' => $this->db->lastId()], 201);
    }

    public function update(int $employeeId, int $id): void
    {
        $d = $this->request->json();
        $this->db->query(
            "UPDATE employee_salaries
             SET salary_component_id=?, amount=?, effective_date=?, end_date=?, updated_at=?
             WHERE id=? AND employee_id=?",
            [
                $d['salary_component_id'] ?? null,
                $d['amount'] ?? null,
                $d['effective_date'] ?? null,
                $d['end_date'] ?? null,
                date('Y-m-d H:i:s'),
                $id,
                $employeeId,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $employeeId, int $id): void
    {
        $this->db->query("DELETE FROM employee_salaries WHERE id=? AND employee_id=?", [$id, $employeeId]);
        Response::json(['deleted' => $id]);
    }
}
