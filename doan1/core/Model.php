<?php

abstract class Model
{
    protected Database $db;
    protected string $table;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function all(): array
    {
        return $this->db->query("SELECT * FROM {$this->table}")->fetchAll();
    }

    public function find(int $id): ?array
    {
        $row = $this->db->query("SELECT * FROM {$this->table} WHERE id = ?", [$id])->fetch();
        return $row ?: null;
    }
}
