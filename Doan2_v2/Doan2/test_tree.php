<?php

use App\Repositories\OrganizationChartRepository;
use App\Support\TenantContext;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$repo = new OrganizationChartRepository;
TenantContext::set(1, 1);
$tree = $repo->getNestedTree();
$active = DB::table('employees')->where('tenant_id', 1)->where('status', '!=', 'TERMINATED')->count();
$count = function (array $nodes) use (&$count): int {
    return count($nodes) + array_sum(array_map(fn ($node) => $count($node['children'] ?? []), $nodes));
};

if (count($tree) !== 1 || $count($tree) !== $active) {
    throw new RuntimeException('Organization chart is not one complete tree');
}

echo "Organization chart OK: {$active} employees, 1 root\n";
