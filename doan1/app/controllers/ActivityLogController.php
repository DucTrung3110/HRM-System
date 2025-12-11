<?php

class ActivityLogController extends Controller
{
    public function index(): void
    {
        $byUserId = $this->request->query('by_user_id') ?? $this->request->query('user_id');
        $action = $this->request->query('action');
        $table = $this->request->query('table_name');
        $recordId = $this->request->query('record_id');

        $sql = "SELECT * FROM activity_logs WHERE 1=1";
        $params = [];
        if ($byUserId) {
            $sql .= " AND by_user_id = ?";
            $params[] = $byUserId;
        }
        if ($action) {
            $sql .= " AND action = ?";
            $params[] = $action;
        }
        if ($table) {
            $sql .= " AND table_name = ?";
            $params[] = $table;
        }
        if ($recordId) {
            $sql .= " AND record_id = ?";
            $params[] = $recordId;
        }
        $sql .= " ORDER BY `at` DESC";

        $rows = $this->db->query($sql, $params)->fetchAll();
        Response::json($rows);
    }
}
