<?php

class SalaryComponentController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query("SELECT * FROM salary_components")->fetchAll();
        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $this->db->query(
            "INSERT INTO salary_components (code, name, type, category, is_taxable, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
            [
                $d['code'] ?? null,
                $d['name'] ?? null,
                $d['type'] ?? null,
                $d['category'] ?? null,
                $d['is_taxable'] ?? 1,
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
        $this->db->query(
            "UPDATE salary_components SET code=?, name=?, type=?, category=?, is_taxable=?, is_active=?, updated_at=? WHERE id=?",
            [
                $d['code'] ?? null,
                $d['name'] ?? null,
                $d['type'] ?? null,
                $d['category'] ?? null,
                $d['is_taxable'] ?? 1,
                $d['is_active'] ?? 1,
                date('Y-m-d H:i:s'),
                $id,
            ]
        );
        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM salary_components WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
