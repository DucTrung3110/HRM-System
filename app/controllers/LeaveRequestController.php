<?php

class LeaveRequestController extends Controller
{
    public function index(): void
    {
        $status = $this->request->query('status');
        $employeeId = $this->request->query('employee_id');

        $sql = "SELECT lr.*, lt.name AS leave_type, e.full_name
                FROM leave_requests lr
                JOIN leave_types lt ON lr.leave_type_id = lt.id
                JOIN employees e ON lr.employee_id = e.id
                WHERE 1=1";
        $params = [];
        if ($status) {
            $sql .= " AND lr.status = ?";
            $params[] = $status;
        }
        if ($employeeId) {
            $sql .= " AND lr.employee_id = ?";
            $params[] = $employeeId;
        }
        $sql .= " ORDER BY lr.created_at DESC";
        $rows = $this->db->query($sql, $params)->fetchAll();
        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $start = $d['start_date'] ?? null;
        $end = $d['end_date'] ?? null;
        $totalDays = $d['total_days'] ?? null;
        if (!$totalDays && $start && $end) {
            $diff = (strtotime($end) - strtotime($start)) / 86400;
            $totalDays = $diff >= 0 ? $diff + 1 : null;
        }
        $this->db->query(
            "INSERT INTO leave_requests (
                employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_at, updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            [
                $d['employee_id'] ?? null,
                $d['leave_type_id'] ?? null,
                $d['start_date'] ?? null,
                $d['end_date'] ?? null,
                $totalDays,
                $d['reason'] ?? null,
                $d['status'] ?? 'pending',
                $d['approved_by'] ?? null,
                $d['approved_at'] ?? null,
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
            ]
        );
        Response::json(['id' => $this->db->lastId()], 201);
    }

    public function update(int $id): void
    {
        $d = $this->request->json();
        $start = $d['start_date'] ?? null;
        $end = $d['end_date'] ?? null;
        $totalDays = $d['total_days'] ?? null;
        if (!$totalDays && $start && $end) {
            $diff = (strtotime($end) - strtotime($start)) / 86400;
            $totalDays = $diff >= 0 ? $diff + 1 : null;
        }
        $this->db->query(
            "UPDATE leave_requests 
             SET employee_id = COALESCE(?, employee_id),
                 leave_type_id = COALESCE(?, leave_type_id),
                 start_date = COALESCE(?, start_date),
                 end_date = COALESCE(?, end_date),
                 total_days = COALESCE(?, total_days),
                 reason = COALESCE(?, reason),
                 status = COALESCE(?, status),
                 approved_by = COALESCE(?, approved_by),
                 approved_at = COALESCE(?, approved_at),
                 updated_at = ?
             WHERE id=?",
            [
                $d['employee_id'] ?? null,
                $d['leave_type_id'] ?? null,
                $start,
                $end,
                $totalDays,
                $d['reason'] ?? null,
                $d['status'] ?? null,
                $d['approved_by'] ?? null,
                $d['approved_at'] ?? null,
                date('Y-m-d H:i:s'),
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }
}
