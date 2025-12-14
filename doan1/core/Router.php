<?php

class RouteDefinition
{
    private Router $router;
    private int $index;

    public function __construct(Router $router, int $index)
    {
        $this->router = $router;
        $this->index = $index;
    }

    public function middleware(string ...$names): self
    {
        $this->router->attachMiddleware($this->index, $names);
        return $this;
    }
}

class Router
{
    private array $routes = [];
    private array $middlewares = [];
    private Database $db;
    private Request $request;

    public function __construct(Database $db, Request $request)
    {
        $this->db = $db;
        $this->request = $request;
        $this->registerDefaultMiddlewares();
    }

    public function get(string $path, $handler): RouteDefinition
    {
        return $this->add('GET', $path, $handler);
    }

    public function post(string $path, $handler): RouteDefinition
    {
        return $this->add('POST', $path, $handler);
    }

    public function patch(string $path, $handler): RouteDefinition
    {
        return $this->add('PATCH', $path, $handler);
    }

    public function delete(string $path, $handler): RouteDefinition
    {
        return $this->add('DELETE', $path, $handler);
    }

    public function registerMiddleware(string $name, callable $fn): void
    {
        $this->middlewares[$name] = $fn;
    }

    public function attachMiddleware(int $routeIndex, array $names): void
    {
        $this->routes[$routeIndex]['middlewares'] = array_merge(
            $this->routes[$routeIndex]['middlewares'],
            $names
        );
    }

    public function dispatch(string $method, string $path): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (!preg_match($route['pattern'], $path, $matches)) {
                continue;
            }

            $params = [];
            foreach ($route['param_names'] as $idx => $name) {
                $params[$name] = $matches[$idx + 1] ?? null;
            }

            if (!$this->runMiddlewares($route['middlewares'], $params)) {
                return;
            }

            $handler = $route['handler'];
            if (is_array($handler)) {
                [$class, $action] = $handler;
                $controller = new $class($this->db, $this->request);
                call_user_func_array([$controller, $action], array_values(array: $params));
                return;
            }

            if (is_callable($handler)) {
                call_user_func_array($handler, [$this->request, $params]);
                return;
            }

            Response::error('Handler not callable', 500);
            return;
        }

        Response::error('Not found', 404);
    }

    private function add(string $method, string $path, $handler): RouteDefinition
    {
        $paramNames = [];
        preg_match_all('#\{([^/]+)\}#', $path, $paramNames);
        $names = $paramNames[1] ?? [];
        $pattern = '#^' . preg_replace('#\{[^/]+\}#', '([^/]+)', $path) . '$#';

        $this->routes[] = [
            'method'       => $method,
            'path'         => $path,
            'pattern'      => $pattern,
            'handler'      => $handler,
            'middlewares'  => [],
            'param_names'  => $names,
        ];
        return new RouteDefinition($this, count($this->routes) - 1);
    }

    private function registerDefaultMiddlewares(): void
    {
        $self = $this;
        $this->registerMiddleware('auth', function (array $params) use ($self) {
            $token = $self->request->bearerToken();
            $payload = Auth::parse($token, $_ENV['JWT_SECRET'] ?? '');
            if (!$payload || !isset($payload['sub'])) {
                Response::error('Unauthorized', 401);
                return false;
            }
            $self->request->setAttribute('auth', $payload);
            return true;
        });
        $this->registerMiddleware('permission', function () {
            // placeholder to allow "perm:CODE" syntax handling in runMiddlewares
        });
    }

    private function runMiddlewares(array $names, array $params): bool
    {
        foreach ($names as $name) {
            if (str_starts_with($name, 'role:')) {
                $allowed = explode(',', substr($name, 5));
                $auth = $this->request->getAttribute('auth');
                $roles = $auth['roles'] ?? [];
                if (is_string($roles)) {
                    $roles = [$roles];
                }
                $hasRole = array_intersect($allowed, $roles);
                if (!$auth || empty($hasRole)) {
                    Response::error('Forbidden', 403);
                    return false;
                }
                continue;
            }
            if (str_starts_with($name, 'perm:')) {
                $allowedPerms = explode(',', substr($name, 5));
                $auth = $this->request->getAttribute('auth');
                $perms = $auth['permissions'] ?? [];
                if (is_string($perms)) {
                    $perms = [$perms];
                }
                $hasPerm = array_intersect($allowedPerms, $perms);
                if (!$auth || empty($hasPerm)) {
                    Response::error('Forbidden', 403);
                    return false;
                }
                continue;
            }

            $mw = $this->middlewares[$name] ?? null;
            if (!$mw) {
                Response::error("Middleware {$name} not found", 500);
                return false;
            }
            $result = $mw($params);
            if ($result === false) {
                return false;
            }
        }
        return true;
    }
}
