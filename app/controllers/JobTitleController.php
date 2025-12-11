<?php

class JobTitleController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query(
            "SELECT jt.*, jf.name AS family_name 
             FROM job_titles jt 
             LEFT JOIN job_families jf ON jt.job_family_id = jf.id"
        )->fetchAll();
        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "INSERT INTO job_titles (code, name, job_level, job_family_id, is_active, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?)",
            [
                $d['code'] ?? null,
                $d['name'] ?? null,
                $d['job_level'] ?? null,
                $d['job_family_id'] ?? null,
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
        $current = $this->db->query("SELECT * FROM job_titles WHERE id = ?", [$id])->fetch();
        if (!$current) {
            Response::json(['error' => 'Not found'], 404);
            return;
        }
        $now = date('Y-m-d H:i:s');
        $this->db->query(
            "UPDATE job_titles SET code=?, name=?, job_level=?, job_family_id=?, is_active=?, updated_at=? WHERE id=?",
            [
                $d['code'] ?? $current['code'],
                $d['name'] ?? $current['name'],
                $d['job_level'] ?? $current['job_level'],
                $d['job_family_id'] ?? $current['job_family_id'],
                $d['is_active'] ?? $current['is_active'],
                $now,
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM job_titles WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
