<?php

class WorkScheduleController extends Controller
{
    public function index(): void
    {
        $employeeId = $this->request->query('employee_id');
        $from = $this->request->query('from');
        $to = $this->request->query('to');

        $sql = "SELECT ws.*, s.name AS shift_name
                FROM work_schedules ws
                JOIN work_shifts s ON ws.shift_id = s.id
                WHERE 1=1";
        $params = [];
        if ($employeeId) {
            $sql .= " AND ws.employee_id = ?";
            $params[] = $employeeId;
        }
        if ($from) {
            $sql .= " AND ws.work_date >= ?";
            $params[] = $from;
        }
        if ($to) {
            $sql .= " AND ws.work_date <= ?";
            $params[] = $to;
        }
        $sql .= " ORDER BY ws.work_date ASC";

        $rows = $this->db->query($sql, $params)->fetchAll();
        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();

        // Tránh lỗi 500 do unique (employee_id, work_date)
        $dup = $this->db->query(
            "SELECT id FROM work_schedules WHERE employee_id=? AND work_date=?",
            [$d['employee_id'] ?? null, $d['work_date'] ?? null]
        )->fetch();
        if ($dup) {
            Response::json(['error' => 'Work schedule already exists for this employee and date'], 409);
            return;
        }

        $this->db->query(
            "INSERT INTO work_schedules (employee_id, work_date, shift_id, actual_start_time, actual_end_time, total_hours, overtime_hours, status, note, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            [
                $d['employee_id'] ?? null,
                $d['work_date'] ?? null,
                $d['shift_id'] ?? null,
                $d['actual_start_time'] ?? null,
                $d['actual_end_time'] ?? null,
                $d['total_hours'] ?? null,
                $d['overtime_hours'] ?? null,
                $d['status'] ?? 'scheduled',
                $d['note'] ?? null,
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
            ]
        );
        Response::json(['id' => $this->db->lastId()], 201);
    }

    public function update(int $id): void
    {
        $d = $this->request->json();
        $current = $this->db->query("SELECT * FROM work_schedules WHERE id = ?", [$id])->fetch();
        if (!$current) {
            Response::json(['error' => 'Not found'], 404);
            return;
        }
        $this->db->query(
            "UPDATE work_schedules 
             SET work_date=?, shift_id=?, actual_start_time=?, actual_end_time=?, total_hours=?, overtime_hours=?, status=?, note=?, updated_at=?
             WHERE id=?",
            [
                $d['work_date'] ?? $current['work_date'],
                $d['shift_id'] ?? $current['shift_id'],
                $d['actual_start_time'] ?? $current['actual_start_time'],
                $d['actual_end_time'] ?? $current['actual_end_time'],
                $d['total_hours'] ?? $current['total_hours'],
                $d['overtime_hours'] ?? $current['overtime_hours'],
                $d['status'] ?? $current['status'],
                $d['note'] ?? $current['note'],
                date('Y-m-d H:i:s'),
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM work_schedules WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
