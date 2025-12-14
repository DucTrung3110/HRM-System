<?php
// Database configuration; pulled from .env with sensible defaults.
return [
    'host'    => $_ENV['DB_HOST'] ?? 'localhost',
    'port'    => (int) ($_ENV['DB_PORT'] ?? 3306),
    'db'      => $_ENV['DB_NAME'] ?? 'hrm',
    'user'    => $_ENV['DB_USER'] ?? 'hrm_admin',
    'pass'    => $_ENV['DB_PASS'] ?? 'Hoang2002@',
    // Optional root credentials if you need elevated DB ops (e.g., bootstrap DB/user).
    'root_pass' => $_ENV['DB_ROOT_PASS'] ?? 'NgocHoang2808@',
    'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
];
