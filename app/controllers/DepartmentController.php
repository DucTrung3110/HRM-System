<?php

class DepartmentController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query("SELECT * FROM departments")->fetchAll();
        Response::json($rows);
    }

    public function show(int $id): void
    {
        $row = $this->db->query("SELECT * FROM departments WHERE id = ?", [$id])->fetch();
        if (!$row) {
            Response::error('Department not found', 404);
            return;
        }
        Response::json($row);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "INSERT INTO departments (code, name, manager_id, parent_id, is_active, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?)",
            [
                $d['code'] ?? null,
                $d['name'] ?? null,
                $d['manager_id'] ?? null,
                $d['parent_id'] ?? null,
                $d['is_active'] ?? 1,
                $now,
                $now,
            ]
        );
        Response::json(['id' => $this->db->lastId()], 201);
    }

    public function update(int $id): void
    {
        $d = $this->request->json();
        $existing = $this->db->query("SELECT * FROM departments WHERE id = ?", [$id])->fetch();
        if (!$existing) {
            Response::error('Department not found', 404);
            return;
        }

        // Preserve current values when fields không được gửi lên
        $payload = [
            'code'       => array_key_exists('code', $d) ? $d['code'] : $existing['code'],
            'name'       => array_key_exists('name', $d) ? $d['name'] : $existing['name'],
            'manager_id' => array_key_exists('manager_id', $d) ? $d['manager_id'] : $existing['manager_id'],
            'parent_id'  => array_key_exists('parent_id', $d) ? $d['parent_id'] : $existing['parent_id'],
            'is_active'  => array_key_exists('is_active', $d) ? $d['is_active'] : $existing['is_active'],
        ];

        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "UPDATE departments SET code=?, name=?, manager_id=?, parent_id=?, is_active=?, updated_at=? WHERE id=?",
            [
                $payload['code'],
                $payload['name'],
                $payload['manager_id'],
                $payload['parent_id'],
                $payload['is_active'],
                $now,
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM departments WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
