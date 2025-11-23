<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Vai trò & Phân quyền</h1>
        <p class="text-muted-foreground mt-1">Quản lý vai trò và cấp quyền trong hệ thống</p>
      </div>
      <BaseButton
        @click="showCreateModal = true"
        data-testid="button-create-role"
      >
        + Thêm vai trò
      </BaseButton>
    </div>
    
    <!-- Roles List -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard title="Danh sách vai trò" class="lg:col-span-1">
        <div class="space-y-2">
          <div
            v-for="role in roles"
            :key="role.id"
            @click="selectRole(role)"
            :class="['p-3 rounded-lg cursor-pointer transition-colors hover-elevate',
                     selectedRole?.id === role.id ? 'bg-primary/10 border-l-4 border-primary' : '']"
            :data-testid="`role-item-${role.id}`"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ role.name }}</p>
                <p class="text-xs text-muted-foreground">{{ role.code }}</p>
              </div>
              <BaseBadge
                :variant="role.is_active ? 'success' : 'default'"
                size="sm"
              >
                {{ role.is_active ? 'Active' : 'Inactive' }}
              </BaseBadge>
            </div>
            <p v-if="role.description" class="text-xs text-muted-foreground mt-1">
              {{ role.description }}
            </p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard title="Chi tiết vai trò" class="lg:col-span-2">
        <div v-if="selectedRole" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Mã vai trò</p>
              <p class="font-medium">{{ selectedRole.code }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Tên vai trò</p>
              <p class="font-medium">{{ selectedRole.name }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-muted-foreground">Mô tả</p>
              <p class="font-medium">{{ selectedRole.description || 'Không có mô tả' }}</p>
            </div>
          </div>
          
          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-3">Quyền hạn</h3>
            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="permission in availablePermissions"
                :key="permission.key"
                class="flex items-center gap-2 p-2 rounded-lg hover-elevate cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="hasPermission(permission.key)"
                  class="w-4 h-4 rounded border-input"
                  :data-testid="`checkbox-permission-${permission.key}`"
                />
                <span class="text-sm">{{ permission.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-3">Người dùng với vai trò này</h3>
            <div class="space-y-2">
              <div
                v-for="user in roleUsers"
                :key="user.id"
                class="flex items-center gap-3 p-2 rounded-lg hover-elevate"
              >
                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {{ getInitials(user.name) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                </div>
              </div>
              <div v-if="!roleUsers.length" class="text-center py-4 text-muted-foreground text-sm">
                Chưa có người dùng
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          Chọn một vai trò để xem chi tiết
        </div>
      </BaseCard>
    </div>
    
    <!-- Create Role Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Thêm vai trò mới"
      data-testid="modal-create-role"
    >
      <div class="space-y-4">
        <BaseInput label="Mã vai trò" required data-testid="input-role-code" />
        <BaseInput label="Tên vai trò" required data-testid="input-role-name" />
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Mô tả</label>
          <textarea
            class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows="3"
            placeholder="Mô tả vai trò..."
            data-testid="textarea-description"
          ></textarea>
        </div>
      </div>
      
      <template #footer>
        <BaseButton variant="outline" @click="showCreateModal = false">Hủy</BaseButton>
        <BaseButton @click="handleCreate">Tạo mới</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseModal from '../components/BaseModal.vue';
import type { Role, User } from '../types';

const showCreateModal = ref(false);
const roles = ref<Role[]>([]);
const selectedRole = ref<Role | null>(null);
const roleUsers = ref<User[]>([]);

const availablePermissions = [
  { key: 'employee.view', label: 'Xem nhân viên' },
  { key: 'employee.create', label: 'Thêm nhân viên' },
  { key: 'employee.edit', label: 'Sửa nhân viên' },
  { key: 'employee.delete', label: 'Xóa nhân viên' },
  { key: 'department.view', label: 'Xem phòng ban' },
  { key: 'department.manage', label: 'Quản lý phòng ban' },
  { key: 'attendance.view', label: 'Xem chấm công' },
  { key: 'attendance.manage', label: 'Quản lý chấm công' },
  { key: 'leave.view', label: 'Xem nghỉ phép' },
  { key: 'leave.approve', label: 'Duyệt nghỉ phép' },
  { key: 'salary.view', label: 'Xem lương' },
  { key: 'salary.manage', label: 'Quản lý lương' },
];

const hasPermission = (key: string) => {
  if (!selectedRole.value?.permissions) return false;
  return selectedRole.value.permissions[key] === true;
};

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const selectRole = (role: Role) => {
  selectedRole.value = role;
  // Load users with this role
  roleUsers.value = [
    { id: 1, name: 'Admin User', email: 'admin@company.com', role_id: role.id }
  ] as any;
};

const handleCreate = () => {
  showCreateModal.value = false;
};

onMounted(() => {
  // Mock data
  roles.value = [
    {
      id: 1,
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Full system access',
      permissions: {
        'employee.view': true,
        'employee.create': true,
        'employee.edit': true,
        'employee.delete': true,
        'department.view': true,
        'department.manage': true,
        'attendance.view': true,
        'attendance.manage': true,
        'leave.view': true,
        'leave.approve': true,
        'salary.view': true,
        'salary.manage': true
      },
      is_active: true
    },
    {
      id: 2,
      code: 'MANAGER',
      name: 'Manager',
      description: 'Department manager',
      permissions: {
        'employee.view': true,
        'employee.edit': true,
        'department.view': true,
        'attendance.view': true,
        'leave.view': true,
        'leave.approve': true
      },
      is_active: true
    },
    {
      id: 3,
      code: 'EMPLOYEE',
      name: 'Employee',
      description: 'Standard employee',
      permissions: {
        'employee.view': true,
        'attendance.view': true,
        'leave.view': true
      },
      is_active: true
    }
  ];
});
</script>
