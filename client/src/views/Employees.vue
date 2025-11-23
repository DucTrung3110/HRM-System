<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Nhân viên</h1>
        <p class="text-muted-foreground mt-1">Danh sách và quản lý thông tin nhân viên</p>
      </div>
      <BaseButton
        @click="showCreateModal = true"
        data-testid="button-create-employee"
      >
        + Thêm nhân viên
      </BaseButton>
    </div>

    <!-- Filters -->
    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseInput
          v-model="filters.search"
          placeholder="Tìm kiếm theo tên, mã NV..."
          data-testid="input-search-employee"
        />
        <BaseSelect
          v-model="filters.department"
          :options="departmentOptions"
          placeholder="Tất cả phòng ban"
          data-testid="select-department-filter"
        />
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Tất cả trạng thái"
          data-testid="select-status-filter"
        />
        <BaseButton
          variant="outline"
          @click="applyFilters"
          data-testid="button-apply-filters"
        >
          Áp dụng
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Employee Table -->
    <BaseCard>
      <BaseTable
        :columns="columns"
        :data="employees"
        data-testid="table-employees"
      >
        <template #cell-full_name="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {{ getInitials(item.full_name) }}
            </div>
            <div>
              <p class="font-medium">{{ item.full_name }}</p>
              <p class="text-xs text-muted-foreground">{{ item.code }}</p>
            </div>
          </div>
        </template>

        <template #cell-department="{ item }">
          <span class="text-sm">{{ item.department?.name || '-' }}</span>
        </template>

        <template #cell-job_title="{ item }">
          <span class="text-sm">{{ item.job_title?.name || '-' }}</span>
        </template>

        <template #cell-status="{ item }">
          <BaseBadge
            :variant="getStatusVariant(item.current_position?.employment_status)"
            data-testid="badge-employee-status"
          >
            {{ getStatusText(item.current_position?.employment_status) }}
          </BaseBadge>
        </template>

        <template #actions="{ item }">
          <div class="flex items-center gap-2">
            <button
              @click="viewEmployee(item)"
              class="p-1 rounded hover-elevate"
              data-testid="button-view-employee"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click="editEmployee(item)"
              class="p-1 rounded hover-elevate"
              data-testid="button-edit-employee"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="deleteEmployee(item)"
              class="p-1 rounded hover-elevate text-destructive"
              data-testid="button-delete-employee"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Create/Edit Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Thêm nhân viên mới"
      size="lg"
      data-testid="modal-create-employee"
    >
      <div class="grid grid-cols-2 gap-4">
        <BaseInput label="Họ và tên" required data-testid="input-full-name" />
        <BaseInput label="Mã nhân viên" required data-testid="input-code" />
        <BaseInput label="Email" type="email" data-testid="input-email" />
        <BaseInput label="Số điện thoại" data-testid="input-phone" />
        <BaseSelect label="Phòng ban" :options="departmentOptions" data-testid="select-department" />
        <BaseSelect label="Chức danh" :options="[]" data-testid="select-job-title" />
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showCreateModal = false">Hủy</BaseButton>
        <BaseButton @click="handleCreateEmployee">Tạo mới</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import type { Employee } from '../types';

const router = useRouter();

const showCreateModal = ref(false);
const employees = ref<Employee[]>([]);

const filters = ref({
  search: '',
  department: '',
  status: ''
});

const columns = [
  { key: 'full_name', label: 'Nhân viên' },
  { key: 'personal_email', label: 'Email' },
  { key: 'department', label: 'Phòng ban' },
  { key: 'job_title', label: 'Chức danh' },
  { key: 'status', label: 'Trạng thái' },
];

const departmentOptions = [
  { label: 'IT Department', value: '1' },
  { label: 'HR Department', value: '2' },
  { label: 'Sales Department', value: '3' },
];

const statusOptions = [
  { label: 'Đang làm việc', value: 'active' },
  { label: 'Thử việc', value: 'probation' },
  { label: 'Tạm ngưng', value: 'suspended' },
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusVariant = (status: string | undefined) => {
  const variants: Record<string, any> = {
    active: 'success',
    probation: 'warning',
    suspended: 'error',
    inactive: 'default'
  };
  return variants[status || 'inactive'] || 'default';
};

const getStatusText = (status: string | undefined) => {
  const texts: Record<string, string> = {
    active: 'Đang làm việc',
    probation: 'Thử việc',
    suspended: 'Tạm ngưng',
    inactive: 'Nghỉ việc'
  };
  return texts[status || 'inactive'] || 'Không xác định';
};

const applyFilters = () => {
  // TODO: Apply filters and fetch filtered data
  console.log('Applying filters:', filters.value);
};

const viewEmployee = (employee: Employee) => {
  router.push(`/employees/${employee.id}`);
};

const editEmployee = (employee: Employee) => {
  // TODO: Open edit modal with employee data
  console.log('Edit employee:', employee);
};

const deleteEmployee = (employee: Employee) => {
  // TODO: Show confirmation and delete
  console.log('Delete employee:', employee);
};

const handleCreateEmployee = () => {
  // TODO: Create employee via API
  showCreateModal.value = false;
};

onMounted(async () => {
  // TODO: Fetch employees from API
  // Mock data
  employees.value = [
    {
      id: 1,
      code: 'EMP001',
      full_name: 'Nguyễn Văn A',
      personal_email: 'nguyenvana@email.com',
      department: { id: 1, name: 'IT Department', code: 'IT', is_active: true },
      job_title: { id: 1, name: 'Senior Developer', code: 'SD', job_level: 'senior', is_active: true },
      current_position: { employment_status: 'active' } as any
    },
    {
      id: 2,
      code: 'EMP002',
      full_name: 'Trần Thị B',
      personal_email: 'tranthib@email.com',
      department: { id: 2, name: 'HR Department', code: 'HR', is_active: true },
      job_title: { id: 2, name: 'HR Manager', code: 'HRM', job_level: 'manager', is_active: true },
      current_position: { employment_status: 'active' } as any
    },
    {
      id: 3,
      code: 'EMP003',
      full_name: 'Lê Văn C',
      personal_email: 'levanc@email.com',
      department: { id: 3, name: 'Sales Department', code: 'SALES', is_active: true },
      job_title: { id: 3, name: 'Sales Executive', code: 'SE', job_level: 'junior', is_active: true },
      current_position: { employment_status: 'probation' } as any
    }
  ] as any;
});
</script>