<?php

class AttendanceController extends Controller
{
    public function index(): void
    {
        $employeeId = $this->request->query('employee_id');
        $from = $this->request->query('from');
        $to = $this->request->query('to');

        $sql = "SELECT * FROM attendance_records WHERE 1=1";
        $params = [];
        if ($employeeId) {
            $sql .= " AND employee_id = ?";
            $params[] = $employeeId;
        }
        if ($from) {
            $sql .= " AND record_date >= ?";
            $params[] = $from;
        }
        if ($to) {
            $sql .= " AND record_date <= ?";
            $params[] = $to;
        }
        $sql .= " ORDER BY record_date DESC";

        $rows = $this->db->query($sql, $params)->fetchAll();
        Response::json($rows);
    }

    public function checkin(): void
    {
        $d = $this->request->json();
        $now = date('Y-m-d H:i:s');
        $today = date('Y-m-d');
        $this->db->query(
            "INSERT INTO attendance_records (employee_id, record_date, check_in_time, status, created_at, updated_at)
             VALUES (?,?,?,?,?,?)",
            [
                $d['employee_id'] ?? null,
                $today,
                $now,
                $d['status'] ?? 'present',
                $now,
                $now,
            ]
        );
        Response::json(['id' => $this->db->lastId(), 'check_in_time' => $now], 201);
    }

    public function checkout(): void
    {
        $d = $this->request->json();
        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "UPDATE attendance_records SET check_out_time = ?, status = ?, updated_at = ? WHERE id = ?",
            [$now, $d['status'] ?? 'present', $now, $d['id'] ?? null]
        );
        Response::json(['id' => $d['id'] ?? null, 'check_out_time' => $now]);
    }

    public function update(int $id): void
    {
        $d = $this->request->json();
        $this->db->query(
            "UPDATE attendance_records
             SET record_date=?, check_in_time=?, check_out_time=?, total_work_hours=?, late_minutes=?, early_leave_minutes=?, overtime_hours=?, status=?, updated_at=?
             WHERE id=?",
            [
                $d['record_date'] ?? null,
                $d['check_in_time'] ?? null,
                $d['check_out_time'] ?? null,
                $d['total_work_hours'] ?? null,
                $d['late_minutes'] ?? null,
                $d['early_leave_minutes'] ?? null,
                $d['overtime_hours'] ?? null,
                $d['status'] ?? null,
                date('Y-m-d H:i:s'),
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }
}
