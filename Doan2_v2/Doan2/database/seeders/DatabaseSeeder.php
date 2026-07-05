<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LegacyDataSqlSeeder::class);

        DB::table('roles')->updateOrInsert(
            ['role_code' => 'ADMIN'],
            [
                'role_name' => 'Administrator',
                'description' => 'System administrator',
                'is_system_role' => 'true',
                'tenant_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        // RBAC access theo role (roles.meta). BẮT BUỘC set — AccessControl fail-OPEN
        // khi meta thiếu key 'modules' (coi như full admin), nên role không cấu hình
        // = mọi nhân viên thành admin. Set tường minh để đóng lỗ hổng đó.
        $roleMeta = [
            'ADMIN' => ['is_admin' => true],
            'HR' => ['modules' => ['hr', 'time', 'recruitment', 'communications']],
            'MANAGER' => ['modules' => ['time']],
            'ACCOUNTANT' => ['modules' => ['payroll']],
            'EMPLOYEE' => ['modules' => []],
        ];
        foreach ($roleMeta as $code => $meta) {
            DB::table('roles')->where('role_code', $code)
                ->update(['meta' => json_encode($meta), 'updated_at' => now()]);
        }

        // An (NV0001) = tài khoản admin demo → cần role ADMIN (org phẳng nên không
        // tự có quyền admin sau khi meta được cấu hình đúng).
        $adminRoleId = DB::table('roles')->where('role_code', 'ADMIN')->value('id');
        $an = DB::table('employees')->where('company_email', 'an.nguyen@company.com')->value('id');
        if ($adminRoleId && $an) {
            DB::table('employee_roles')->updateOrInsert(
                ['employee_id' => $an, 'role_id' => $adminRoleId],
                ['is_active' => 'true', 'tenant_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            );
        }

        DB::table('employees')->updateOrInsert(
            ['company_email' => 'admin@company.com'],
            [
                'employee_code' => 'AD0001',
                'full_name' => 'System Administrator',
                'password_hash' => Hash::make('password'),
                'status' => 'ACTIVE',
                'tenant_id' => 1,
                'legal_entity_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        $employeeId = DB::table('employees')->where('company_email', 'admin@company.com')->value('id');
        $roleId = DB::table('roles')->where('role_code', 'ADMIN')->value('id');

        DB::table('employee_roles')->updateOrInsert(
            ['employee_id' => $employeeId, 'role_id' => $roleId],
            [
                'is_active' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        $this->call(DashboardDemoSeeder::class);
    }
}
