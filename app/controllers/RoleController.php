<?php

class RoleController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query(
            "SELECT r.*, GROUP_CONCAT(DISTINCT p.code) AS permission_codes
             FROM roles r
             LEFT JOIN role_permissions rp ON rp.role_id = r.id
             LEFT JOIN permissions p ON rp.permission_id = p.id
             GROUP BY r.id"
        )->fetchAll();

        $rows = array_map(function ($row) {
            $row['permissions'] = $row['permission_codes'] ? array_values(array_filter(explode(',', $row['permission_codes']))) : [];
            unset($row['permission_codes']);
            return $row;
        }, $rows);

        Response::json($rows);
    }
}
