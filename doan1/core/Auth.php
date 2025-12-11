<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth
{
    public static function issue(array $user, string $secret, int $ttl = 3600): string
    {
        $userId = $user['id'] ?? $user['sub'] ?? null;
        if ($userId === null) {
            throw new InvalidArgumentException('User id missing for token issuance.');
        }

        $payload = [
            'sub'         => $userId,
            'name'        => $user['name'] ?? null,
            'roles'       => $user['roles'] ?? [],
            'permissions' => $user['permissions'] ?? [],
            'exp'         => time() + $ttl,
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }

    public static function parse(?string $token, string $secret): ?array
    {
        if (!$token) {
            return null;
        }
        try {
            return (array) JWT::decode($token, new Key($secret, 'HS256'));
        } catch (Exception) {
            return null;
        }
    }
}
