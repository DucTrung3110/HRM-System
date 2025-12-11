<?php

class WorkShiftController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query("SELECT * FROM work_shifts")->fetchAll();
        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $this->db->query(
            "INSERT INTO work_shifts (code, name, start_time, end_time, break_minutes, total_hours, is_default, is_active, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?)",
            [
                $d['code'] ?? null,
                $d['name'] ?? null,
                $d['start_time'] ?? null,
                $d['end_time'] ?? null,
                $d['break_minutes'] ?? 0,
                $d['total_hours'] ?? null,
                $d['is_default'] ?? 0,
                $d['is_active'] ?? 1,
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
            ]
        );
        Response::json(['id' => $this->db->lastId()], 201);
    }

    public function update(int $id): void
    {
        $d = $this->request->json();
        $current = $this->db->query("SELECT * FROM work_shifts WHERE id = ?", [$id])->fetch();
        if (!$current) {
            Response::json(['error' => 'Not found'], 404);
            return;
        }
        // enforce boolean 0/1 for is_default/is_active
        $isDefault = isset($d['is_default']) ? (int) (bool) $d['is_default'] : (int) $current['is_default'];
        $isActive  = isset($d['is_active']) ? (int) (bool) $d['is_active'] : (int) $current['is_active'];
        $this->db->query(
            "UPDATE work_shifts SET code=?, name=?, start_time=?, end_time=?, break_minutes=?, total_hours=?, is_default=?, is_active=?, updated_at=? WHERE id=?",
            [
                $d['code'] ?? $current['code'],
                $d['name'] ?? $current['name'],
                $d['start_time'] ?? $current['start_time'],
                $d['end_time'] ?? $current['end_time'],
                $d['break_minutes'] ?? $current['break_minutes'],
                $d['total_hours'] ?? $current['total_hours'],
                $isDefault,
                $isActive,
                date('Y-m-d H:i:s'),
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM work_shifts WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
