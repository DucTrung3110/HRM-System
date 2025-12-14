<?php

declare(strict_types=1);

$root = dirname(__DIR__);

// Composer autoload if installed; fallback to simple class loader.
if (file_exists($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
} else {
    spl_autoload_register(function ($class) use ($root) {
        $paths = [
            $root . '/core/' . $class . '.php',
            $root . '/app/controllers/' . $class . '.php',
            $root . '/app/models/' . $class . '.php',
            $root . '/app/services/' . $class . '.php',
        ];
        foreach ($paths as $path) {
            if (file_exists($path)) {
                require $path;
                return;
            }
        }
    });
}

// Load environment variables.
if (class_exists(\Dotenv\Dotenv::class) && file_exists($root . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($root);
    $dotenv->load();
} elseif (file_exists($root . '/.env')) {
    $lines = file($root . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $_ENV[$key] = $value;
    }
}

// Bootstrap core objects.
$config = require $root . '/config/db.php';
$db = new Database($config);
$GLOBALS['db'] = $db;
$request = new Request();
$router = new Router($db, $request);

// Register routes.
require $root . '/app/routes.php';

// Dispatch current request.
try {
    $router->dispatch($request->method(), $request->path());
} catch (Throwable $e) {
    error_log($e->getMessage());
    Response::error('Internal Server Error', 500);
}
