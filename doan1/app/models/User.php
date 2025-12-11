<?php

class User extends Model
{
    protected string $table = 'users';

    public function findWithAuthData(string $email): ?array
    {
        $sql = "SELECT 
                    u.*,
                    GROUP_CONCAT(DISTINCT r.code) AS role_codes,
                    GROUP_CONCAT(DISTINCT p.code) AS permission_codes
                FROM users u
                LEFT JOIN user_roles ur ON ur.user_id = u.id
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN role_permissions rp ON rp.role_id = r.id
                LEFT JOIN permissions p ON rp.permission_id = p.id
                WHERE u.email = ?
                GROUP BY u.id";
        $row = $this->db->query($sql, [$email])->fetch();
        if (!$row) {
            return null;
        }

        $row['roles'] = $row['role_codes'] ? array_values(array_filter(array_unique(explode(',', $row['role_codes'])))) : [];
        $row['permissions'] = $row['permission_codes'] ? array_values(array_filter(array_unique(explode(',', $row['permission_codes'])))) : [];
        return $row;
    }
}
