<?php

class Response
{
    public static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['status' => $code, 'data' => $data], JSON_UNESCAPED_UNICODE);
    }

    public static function error(string $msg, int $code = 400, $details = null): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['status' => $code, 'error' => $msg, 'details' => $details], JSON_UNESCAPED_UNICODE);
    }
}
