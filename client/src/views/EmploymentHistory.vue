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
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import axiosClient from '../services/axiosClient';

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

const loadData = async () => {
  try {
    const response = await axiosClient.get('/employment-histories');
    employmentHistory.value = response.data;
  } catch (error) {
    console.error('Error loading employment history:', error);
  }
};

const loadEmployees = async () => {
  try {
    const response = await axiosClient.get('/employees');
    employeeOptions.value = response.data.map(emp => ({
      value: emp.id,
      label: emp.full_name
    }));
  } catch (error) {
    console.error('Error loading employees:', error);
  }
};

const applyFilters = async () => {
  try {
    const params = {};
    if (filters.value.employee) {
      params.employee_id = filters.value.employee;
    }
    if (filters.value.search) {
      params.search = filters.value.search;
    }
    const response = await axiosClient.get('/employment-histories', { params });
    employmentHistory.value = response.data;
  } catch (error) {
    console.error('Error filtering employment history:', error);
  }
};

onMounted(async () => {
  await Promise.all([loadData(), loadEmployees()]);
});
</script>