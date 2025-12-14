<?php

class UserController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query(
            "SELECT 
                u.id,
                u.name,
                u.email,
                u.remember_token,
                u.created_at,
                u.updated_at,
                GROUP_CONCAT(DISTINCT r.code) AS role_codes
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON ur.role_id = r.id
             GROUP BY u.id"
        )->fetchAll();

        $rows = array_map(function ($row) {
            $row['roles'] = $row['role_codes'] ? array_values(array_filter(explode(',', $row['role_codes']))) : [];
            unset($row['role_codes']);
            return $row;
        }, $rows);

        Response::json($rows);
    }

    public function store(): void
    {
        $d = $this->request->json();
        $hash = password_hash($d['password'] ?? '', PASSWORD_DEFAULT);
        $now = date('Y-m-d H:i:s');

        $this->db->query(
            "INSERT INTO users (name, email, password, remember_token, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            [
                $d['name'] ?? null,
                $d['email'] ?? null,
                $hash,
                $d['remember_token'] ?? null,
                $now,
                $now,
            ]
        );
        $userId = $this->db->lastId();

        $roles = $d['role_ids'] ?? [];
        if (is_numeric($roles)) {
            $roles = [$roles];
        }
        $auth = $this->request->getAttribute('auth');
        $assigner = $auth['sub'] ?? null;
        foreach ($roles as $roleId) {
            $this->db->query(
                "INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES (?,?,?,?)",
                [$userId, $roleId, $assigner, $now]
            );
        }

        Response::json(['id' => $userId], 201);
    }

    public function update(int $id): void
    {
        $d = $this->request->json();

        $fields = ['name' => null, 'email' => null, 'remember_token' => null];
        $updates = [];
        $params = [];
        foreach ($fields as $column => $default) {
            if (array_key_exists($column, $d)) {
                $updates[] = "{$column} = ?";
                $params[] = $d[$column] ?? $default;
            }
        }
        if (!empty($d['password'])) {
            $updates[] = "password = ?";
            $params[] = password_hash($d['password'], PASSWORD_DEFAULT);
        }
        $updates[] = "updated_at = ?";
        $params[] = date('Y-m-d H:i:s');
        $params[] = $id;

        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $this->db->query($sql, $params);

        if (array_key_exists('role_ids', $d)) {
            $roles = $d['role_ids'] ?? [];
            if (is_numeric($roles)) {
                $roles = [$roles];
            }
            $this->db->query("DELETE FROM user_roles WHERE user_id = ?", [$id]);
            $auth = $this->request->getAttribute('auth');
            $assigner = $auth['sub'] ?? null;
            $now = date('Y-m-d H:i:s');
            foreach ($roles as $roleId) {
                $this->db->query(
                    "INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES (?,?,?,?)",
                    [$id, $roleId, $assigner, $now]
                );
            }
        }

        Response::json(['id' => $id]);
    }

    public function destroy(int $id): void
    {
        $this->db->query("DELETE FROM users WHERE id = ?", [$id]);
        Response::json(['deleted' => $id]);
    }
}
