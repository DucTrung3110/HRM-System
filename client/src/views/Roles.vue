<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Vai trò & Phân quyền</h1>
        <p class="text-muted-foreground mt-1">Quản lý vai trò và cấp quyền trong hệ thống</p>
      </div>
      <BaseButton
        @click="openCreateModal"
        data-testid="button-create-role"
      >
        + Thêm vai trò
      </BaseButton>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Lỗi:</p>
      <p class="text-destructive/80 text-sm mt-1">{{ error }}</p>
    </div>
    
    <!-- Roles List -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard title="Danh sách vai trò" class="lg:col-span-1">
        <div v-if="roles.length === 0" class="text-center py-8 text-muted-foreground">
          Chưa có vai trò nào
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="role in roles"
            :key="role.id"
            @click="selectRole(role)"
            :class="['p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted',
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
          
          <!-- Unassigned employees section -->
          <div
            @click="showUnassigned"
            :class="['p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted border-2 border-dashed',
                     viewingUnassigned ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400' : 'border-muted']"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-amber-700 dark:text-amber-300">Chưa có vai trò</p>
                <p class="text-xs text-muted-foreground">Nhân viên chưa được phân loại</p>
              </div>
              <BaseBadge variant="warning" size="sm">
                {{ unassignedEmployees.length }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard title="Chi tiết vai trò" class="lg:col-span-2">
        <div v-if="selectedRole" class="space-y-6">
          <div class="flex justify-between items-start">
            <div class="grid grid-cols-2 gap-4 flex-1">
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
          </div>
          
          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-3">Quyền hạn ({{ selectedRolePermissions.length }} quyền)</h3>
            <div v-if="selectedRolePermissions.length > 0" class="grid grid-cols-2 gap-3">
              <div
                v-for="perm in selectedRolePermissions"
                :key="perm"
                class="flex items-center gap-2 p-2 rounded-lg bg-primary/5"
              >
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm">{{ getPermissionLabel(perm) }}</span>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted-foreground text-sm">
              Chưa có quyền nào được gán
            </div>
          </div>
          
          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-3">Người dùng với vai trò này ({{ computedRoleUsers.length }})</h3>
            <div class="space-y-2">
              <div
                v-for="user in computedRoleUsers"
                :key="user.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
              >
                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {{ getInitials(user.name) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                  <p v-if="user.job_title" class="text-xs text-primary">{{ user.job_title }}</p>
                </div>
                <div class="flex flex-wrap gap-1">
                  <BaseBadge v-if="user.department" size="sm" variant="outline">
                    {{ user.department }}
                  </BaseBadge>
                  <BaseBadge v-for="r in user.roles" :key="r" size="sm" variant="secondary">
                    {{ r }}
                  </BaseBadge>
                </div>
              </div>
              <div v-if="computedRoleUsers.length === 0" class="text-center py-4 text-muted-foreground text-sm">
                Chưa có người dùng nào được gán vai trò này
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="viewingUnassigned" class="space-y-4">
          <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="font-semibold">Nhân viên chưa có vai trò ({{ unassignedEmployees.length }})</h3>
          </div>
          <p class="text-sm text-muted-foreground">
            Những nhân viên này chưa có chức danh hoặc chức danh không khớp với vai trò nào trong hệ thống.
          </p>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="emp in unassignedEmployees"
              :key="emp.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"
            >
              <div class="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-semibold">
                {{ getInitials(emp.name) }}
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ emp.name }}</p>
                <p class="text-xs text-muted-foreground">{{ emp.email }}</p>
                <p class="text-xs text-amber-600 dark:text-amber-400">{{ emp.job_title }}</p>
              </div>
              <BaseBadge v-if="emp.department" size="sm" variant="outline">
                {{ emp.department }}
              </BaseBadge>
            </div>
            <div v-if="unassignedEmployees.length === 0" class="text-center py-8 text-muted-foreground">
              Tất cả nhân viên đều đã có vai trò
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
        <BaseInput 
          v-model="form.code"
          label="Mã vai trò" 
          required 
          placeholder="VD: ADMIN, MANAGER"
          data-testid="input-role-code" 
        />
        <BaseInput 
          v-model="form.name"
          label="Tên vai trò" 
          required 
          placeholder="VD: Quản trị viên"
          data-testid="input-role-name" 
        />
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Mô tả</label>
          <textarea
            v-model="form.description"
            class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows="3"
            placeholder="Mô tả vai trò..."
            data-testid="textarea-description"
          ></textarea>
        </div>
        
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p class="text-amber-800 dark:text-amber-200 text-sm">
            <strong>Lưu ý:</strong> Việc tạo vai trò mới cần được thực hiện trực tiếp trên server backend. 
            Liên hệ quản trị viên hệ thống để thêm vai trò mới.
          </p>
        </div>
      </div>

      <div v-if="formError" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p class="text-destructive text-sm">{{ formError }}</p>
      </div>
      
      <template #footer>
        <BaseButton variant="outline" @click="closeModal">Đóng</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseModal from '../components/BaseModal.vue';
import { roleService } from '../services/roleService';
import { userService } from '../services/userService';
import { employeeService } from '../services/employeeService';

const showCreateModal = ref(false);
const loading = ref(true);
const error = ref('');
const formError = ref('');

const roles = ref([]);
const users = ref([]);
const employees = ref([]);
const selectedRole = ref(null);
const viewingUnassigned = ref(false);

const form = ref({
  code: '',
  name: '',
  description: ''
});

const permissionLabels = {
  'P001': 'Quản lý toàn hệ thống',
  'P002': 'Quản lý người dùng',
  'P003': 'Xem nhân viên & tổ chức',
  'P004': 'Quản lý nhân viên & tổ chức',
  'P005': 'Duyệt đơn nghỉ phép',
  'P006': 'Xem & tạo đơn nghỉ phép',
  'P007': 'Xem thông tin lương',
  'P008': 'Quản lý lương',
  'P009': 'Xem chấm công',
  'P010': 'Quản lý chấm công',
  'P011': 'Xem lịch sử hoạt động',
  'P012': 'Quản lý ca làm việc'
};

const selectedRolePermissions = computed(() => {
  if (!selectedRole.value?.permissions) return [];
  const perms = selectedRole.value.permissions;
  if (Array.isArray(perms)) {
    return perms;
  }
  return Object.keys(perms).filter(k => perms[k]);
});

const computedRoleUsers = computed(() => {
  if (!selectedRole.value) return [];
  const roleCode = selectedRole.value.code;
  const roleName = selectedRole.value.name?.toLowerCase() || '';
  
  const usersWithRole = users.value.filter(user => {
    if (!user.roles) return false;
    return user.roles.includes(roleCode);
  });
  
  const employeesWithRole = employees.value.filter(emp => {
    const jobTitle = (emp.job_title || '').toLowerCase();
    const empRole = (emp.role || '').toLowerCase();
    
    if (roleName.includes('admin') || roleName.includes('quản trị')) {
      return jobTitle.includes('admin') || jobTitle.includes('quản trị') || empRole.includes('admin');
    }
    if (roleName.includes('manager') || roleName.includes('quản lý') || roleName.includes('trưởng')) {
      return jobTitle.includes('manager') || jobTitle.includes('quản lý') || jobTitle.includes('trưởng') || jobTitle.includes('giám đốc');
    }
    if (roleName.includes('hr') || roleName.includes('nhân sự')) {
      return jobTitle.includes('hr') || jobTitle.includes('nhân sự');
    }
    if (roleName.includes('employee') || roleName.includes('nhân viên')) {
      return jobTitle.includes('nhân viên') || (!jobTitle.includes('quản lý') && !jobTitle.includes('trưởng') && !jobTitle.includes('giám đốc'));
    }
    
    return jobTitle.includes(roleName) || roleName.includes(jobTitle);
  }).map(emp => ({
    id: emp.id,
    name: emp.full_name,
    email: emp.personal_email || emp.email || '',
    job_title: emp.job_title || '',
    department: emp.department || '',
    isEmployee: true
  }));
  
  const combined = [
    ...usersWithRole.map(u => ({ ...u, isEmployee: false })),
    ...employeesWithRole
  ];
  
  const uniqueByEmail = combined.reduce((acc, curr) => {
    const key = curr.email?.toLowerCase() || curr.id;
    if (!acc[key]) acc[key] = curr;
    return acc;
  }, {});
  
  return Object.values(uniqueByEmail);
});

const getPermissionLabel = (code) => {
  return permissionLabels[code] || code;
};

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const selectRole = (role) => {
  selectedRole.value = role;
  viewingUnassigned.value = false;
};

const showUnassigned = () => {
  selectedRole.value = null;
  viewingUnassigned.value = true;
};

const matchesAnyRole = (emp) => {
  const jobTitle = (emp.job_title || '').toLowerCase();
  const empRole = (emp.role || '').toLowerCase();
  
  for (const role of roles.value) {
    const roleName = role.name?.toLowerCase() || '';
    
    if (roleName.includes('admin') || roleName.includes('quản trị')) {
      if (jobTitle.includes('admin') || jobTitle.includes('quản trị') || empRole.includes('admin')) return true;
    }
    if (roleName.includes('manager') || roleName.includes('quản lý') || roleName.includes('trưởng')) {
      if (jobTitle.includes('manager') || jobTitle.includes('quản lý') || jobTitle.includes('trưởng') || jobTitle.includes('giám đốc')) return true;
    }
    if (roleName.includes('hr') || roleName.includes('nhân sự')) {
      if (jobTitle.includes('hr') || jobTitle.includes('nhân sự')) return true;
    }
    if (roleName.includes('employee') || roleName.includes('nhân viên')) {
      if (jobTitle.includes('nhân viên')) return true;
    }
    if (jobTitle.includes(roleName) || roleName.includes(jobTitle)) return true;
  }
  
  return false;
};

const unassignedEmployees = computed(() => {
  return employees.value.filter(emp => {
    const jobTitle = emp.job_title || '';
    if (!jobTitle || jobTitle.trim() === '') return true;
    return !matchesAnyRole(emp);
  }).map(emp => ({
    id: emp.id,
    name: emp.full_name,
    email: emp.personal_email || emp.email || '',
    job_title: emp.job_title || 'Chưa có chức danh',
    department: emp.department || ''
  }));
});

const openCreateModal = () => {
  form.value = { code: '', name: '', description: '' };
  formError.value = '';
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  form.value = { code: '', name: '', description: '' };
  formError.value = '';
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [rolesRes, usersRes, empsRes] = await Promise.all([
      roleService.getAll(),
      userService.getAll(),
      employeeService.getAll()
    ]);
    
    roles.value = rolesRes?.data || rolesRes || [];
    users.value = usersRes?.data || usersRes || [];
    employees.value = empsRes?.data || empsRes || [];
  } catch (err) {
    console.error('Error loading roles:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể tải dữ liệu vai trò';
  } finally {
    loading.value = false;
  }
});
</script>
