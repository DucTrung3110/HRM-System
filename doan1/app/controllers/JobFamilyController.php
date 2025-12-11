<?php

class JobFamilyController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query("SELECT * FROM job_families")->fetchAll();
        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "INSERT INTO job_families (code, name, description, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            [
                $d['code'] ?? null,
                $d['name'] ?? null,
                $d['description'] ?? null,
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
        $current = $this->db->query("SELECT * FROM job_families WHERE id = ?", [$id])->fetch();
        if (!$current) {
            Response::json(['error' => 'Not found'], 404);
            return;
        }
        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "UPDATE job_families SET code=?, name=?, description=?, is_active=?, updated_at=? WHERE id=?",
            [
                $d['code'] ?? $current['code'],
                $d['name'] ?? $current['name'],
                $d['description'] ?? $current['description'],
                $d['is_active'] ?? $current['is_active'],
                $now,
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM job_families WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
