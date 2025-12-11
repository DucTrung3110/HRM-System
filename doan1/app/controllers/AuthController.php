<?php

class AuthController extends Controller
{
    public function login(): void
    {
        $input = $this->request->json();
        // Accept either "username" or "email" field; map to email column.
        $identifier = $input['username'] ?? $input['email'] ?? '';
        $password = $input['password'] ?? '';

        $userModel = new User($this->db);
        $user = $userModel->findWithAuthData($identifier);
        // Support both hashed (bcrypt/argon) and plain text seed passwords.
        $stored = $user['password'] ?? '';
        $looksHashed = str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$') || str_starts_with($stored, '$argon2');
        $valid = $looksHashed ? password_verify($password, $stored) : hash_equals((string) $stored, (string) $password);

        if (!$user || !$valid) {
            Response::error('Invalid credentials', 401);
            return;
        }

        $token = Auth::issue([
            'id'          => $user['id'],
            'name'        => $user['name'],
            'roles'       => $user['roles'],
            'permissions' => $user['permissions'],
        ], $_ENV['JWT_SECRET'] ?? 'secret');

        Response::json([
            'token' => $token,
            'user'  => [
                'id'       => $user['id'],
                'name'     => $user['name'],
                'email'    => $user['email'],
                'roles'    => $user['roles'],
                'permissions' => $user['permissions'],
            ],
        ]);
    }
}
