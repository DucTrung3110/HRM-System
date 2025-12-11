<?php

class Database
{
    private PDO $conn;

    public function __construct(array $cfg)
    {
        $port = isset($cfg['port']) ? (int) $cfg['port'] : 3306;
        $dsn = "mysql:host={$cfg['host']};port={$port};dbname={$cfg['db']};charset={$cfg['charset']}";
        $opts = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        $this->conn = new PDO($dsn, $cfg['user'], $cfg['pass'], $opts);
    }

    public function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function lastId(): string
    {
        return $this->conn->lastInsertId();
    }
}
