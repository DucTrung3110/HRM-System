<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Lịch sử công tác</h1>
        <p class="text-muted-foreground mt-1">Lịch sử vị trí công việc của nhân viên</p>
      </div>
    </div>

    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <BaseSelect
          v-model="filters.employee"
          :options="employeeOptions"
          placeholder="Chọn nhân viên"
        />
        <BaseInput
          v-model="filters.search"
          placeholder="Tìm kiếm..."
        />
        <BaseButton @click="applyFilters">Tìm kiếm</BaseButton>
      </div>

      <BaseTable
        :columns="[
          { key: 'employee_name', label: 'Nhân viên' },
          { key: 'department_name', label: 'Phòng ban' },
          { key: 'job_title_name', label: 'Chức danh' },
          { key: 'start_date', label: 'Ngày bắt đầu' },
          { key: 'end_date', label: 'Ngày kết thúc' },
          { key: 'employment_status', label: 'Trạng thái' }
        ]"
        :data="employmentHistory"
      >
        <template #cell-employee_name="{ item }">
          {{ item.employee?.full_name || 'N/A' }}
        </template>
        <template #cell-department_name="{ item }">
          {{ item.department?.name || 'N/A' }}
        </template>
        <template #cell-job_title_name="{ item }">
          {{ item.job_title?.name || 'N/A' }}
        </template>
        <template #cell-employment_status="{ item }">
          <BaseBadge :variant="getStatusVariant(item.employment_status)">
            {{ getStatusText(item.employment_status) }}
          </BaseBadge>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';

const employmentHistory = ref([]);
const employeeOptions = ref([]);
const filters = ref({
  employee: '',
  search: ''
});

const getStatusText = (status) => {
  const statuses = {
    active: 'Đang hoạt động',
    probation: 'Thử việc',
    suspended: 'Tạm ngừng',
    inactive: 'Không hoạt động'
  };
  return statuses[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    active: 'success',
    probation: 'warning',
    suspended: 'secondary',
    inactive: 'destructive'
  };
  return variants[status] || 'default';
};

const applyFilters = () => {
  // Implement filtering
};

onMounted(() => {
  // Mock data for UI preview
  employmentHistory.value = [
    { 
      id: 1, 
      employee_id: 1, 
      employee: { full_name: 'Nguyễn Văn A' },
      department_id: 1,
      department: { name: 'IT' },
      job_title_id: 1,
      job_title: { name: 'Senior Developer' },
      start_date: '2022-01-15', 
      end_date: null, 
      employment_status: 'active' 
    },
    { 
      id: 2, 
      employee_id: 2, 
      employee: { full_name: 'Trần Thị B' },
      department_id: 2,
      department: { name: 'Sales' },
      job_title_id: 2,
      job_title: { name: 'Sales Manager' },
      start_date: '2021-06-20', 
      end_date: null, 
      employment_status: 'active' 
    },
    { 
      id: 3, 
      employee_id: 3, 
      employee: { full_name: 'Lê Văn C' },
      department_id: 1,
      department: { name: 'IT' },
      job_title_id: 3,
      job_title: { name: 'Business Analyst' },
      start_date: '2023-03-10', 
      end_date: null, 
      employment_status: 'probation' 
    },
    { 
      id: 4, 
      employee_id: 4, 
      employee: { full_name: 'Phạm Thị D' },
      department_id: 3,
      department: { name: 'HR' },
      job_title_id: 4,
      job_title: { name: 'HR Specialist' },
      start_date: '2020-08-01', 
      end_date: '2024-12-31', 
      employment_status: 'inactive' 
    },
  ];
  
  employeeOptions.value = [
    { value: 1, label: 'Nguyễn Văn A' },
    { value: 2, label: 'Trần Thị B' },
    { value: 3, label: 'Lê Văn C' },
    { value: 4, label: 'Phạm Thị D' },
  ];
});
</script>