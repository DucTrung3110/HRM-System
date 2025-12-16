<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Lịch sử công tác</h1>
        <p class="text-muted-foreground mt-1">Lịch sử vị trí công việc của nhân viên</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <BaseCard class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stats.totalRecords }}</p>
            <p class="text-sm text-muted-foreground">Tổng hồ sơ</p>
          </div>
        </div>
      </BaseCard>
      <BaseCard class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
            <p class="text-sm text-muted-foreground">Đang hoạt động</p>
          </div>
        </div>
      </BaseCard>
      <BaseCard class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.probation }}</p>
            <p class="text-sm text-muted-foreground">Thử việc</p>
          </div>
        </div>
      </BaseCard>
      <BaseCard class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-600">{{ stats.inactive }}</p>
            <p class="text-sm text-muted-foreground">Không hoạt động</p>
          </div>
        </div>
      </BaseCard>
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

      <div v-if="loading" class="text-center py-8">
        <p class="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>

      <BaseTable
        v-else
        :columns="[
          { key: 'employee_name', label: 'Nhân viên' },
          { key: 'department_name', label: 'Phòng ban' },
          { key: 'job_title_name', label: 'Chức danh' },
          { key: 'start_date', label: 'Ngày bắt đầu' },
          { key: 'end_date', label: 'Ngày kết thúc' },
          { key: 'salary', label: 'Lương' },
          { key: 'employment_status', label: 'Trạng thái' }
        ]"
        :data="filteredHistory"
      >
        <template #cell-employee_name="{ item }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {{ getInitials(item.employee?.full_name) }}
            </div>
            <div>
              <span class="font-medium">{{ item.employee?.full_name || 'N/A' }}</span>
              <p class="text-xs text-muted-foreground">{{ item.employee?.employee_code || '' }}</p>
            </div>
          </div>
        </template>
        <template #cell-department_name="{ item }">
          {{ item.department?.name || 'N/A' }}
        </template>
        <template #cell-job_title_name="{ item }">
          {{ item.job_title?.name || 'N/A' }}
        </template>
        <template #cell-start_date="{ item }">
          {{ formatDate(item.start_date) }}
        </template>
        <template #cell-end_date="{ item }">
          {{ item.end_date ? formatDate(item.end_date) : 'Hiện tại' }}
        </template>
        <template #cell-salary="{ item }">
          <span class="font-medium">{{ formatCurrency(item.salary) }}</span>
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
import { ref, computed, onMounted } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import axiosClient from '../services/axiosClient';

const loading = ref(true);
const employmentHistory = ref([]);
const employeeOptions = ref([{ label: 'Tất cả nhân viên', value: '' }]);
const filters = ref({
  employee: '',
  search: ''
});

const stats = ref({
  totalRecords: 0,
  active: 0,
  probation: 0,
  inactive: 0
});

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatCurrency = (value) => {
  if (!value) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

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

const filteredHistory = computed(() => {
  let result = employmentHistory.value;
  
  if (filters.value.employee) {
    result = result.filter(h => h.employee_id === parseInt(filters.value.employee));
  }
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(h => 
      h.employee?.full_name?.toLowerCase().includes(search) ||
      h.department?.name?.toLowerCase().includes(search) ||
      h.job_title?.name?.toLowerCase().includes(search)
    );
  }
  
  return result;
});

const generateMockData = () => {
  const departments = [
    { id: 1, name: 'Phòng IT' },
    { id: 2, name: 'Phòng Nhân sự' },
    { id: 3, name: 'Phòng Kế toán' },
    { id: 4, name: 'Phòng Kinh doanh' },
    { id: 5, name: 'Phòng Marketing' },
  ];
  
  const jobTitles = [
    { id: 1, name: 'Nhân viên' },
    { id: 2, name: 'Trưởng nhóm' },
    { id: 3, name: 'Phó phòng' },
    { id: 4, name: 'Trưởng phòng' },
    { id: 5, name: 'Giám đốc' },
  ];
  
  const employees = [
    { id: 1, full_name: 'Nguyễn Văn An', employee_code: 'NV001' },
    { id: 2, full_name: 'Trần Thị Bình', employee_code: 'NV002' },
    { id: 3, full_name: 'Lê Văn Cường', employee_code: 'NV003' },
    { id: 4, full_name: 'Phạm Thị Dung', employee_code: 'NV004' },
    { id: 5, full_name: 'Hoàng Văn Em', employee_code: 'NV005' },
    { id: 6, full_name: 'Vũ Thị Phương', employee_code: 'NV006' },
    { id: 7, full_name: 'Đặng Văn Giang', employee_code: 'NV007' },
    { id: 8, full_name: 'Bùi Thị Hoa', employee_code: 'NV008' },
    { id: 9, full_name: 'Ngô Văn Khang', employee_code: 'NV009' },
    { id: 10, full_name: 'Đinh Thị Lan', employee_code: 'NV010' },
  ];
  
  employeeOptions.value = [
    { label: 'Tất cả nhân viên', value: '' },
    ...employees.map(e => ({ label: e.full_name, value: e.id }))
  ];
  
  const statuses = ['active', 'active', 'active', 'active', 'probation', 'inactive'];
  const salaries = [8000000, 10000000, 12000000, 15000000, 18000000, 20000000, 25000000, 30000000];
  
  const mockHistory = [];
  let id = 1;
  
  employees.forEach(emp => {
    const numRecords = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numRecords; i++) {
      const startYear = 2020 + Math.floor(Math.random() * 4);
      const startMonth = Math.floor(Math.random() * 12);
      const startDate = new Date(startYear, startMonth, 1);
      
      let endDate = null;
      if (i < numRecords - 1) {
        const endYear = startYear + Math.floor(Math.random() * 2) + 1;
        const endMonth = Math.floor(Math.random() * 12);
        endDate = new Date(endYear, endMonth, 28);
      }
      
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const job = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const salary = salaries[Math.floor(Math.random() * salaries.length)];
      const status = i === numRecords - 1 ? statuses[Math.floor(Math.random() * statuses.length)] : 'inactive';
      
      mockHistory.push({
        id: id++,
        employee_id: emp.id,
        employee: emp,
        department_id: dept.id,
        department: dept,
        job_title_id: job.id,
        job_title: job,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        salary: salary,
        employment_status: status,
        work_location: 'head_office',
        employment_type: 'full_time'
      });
    }
  });
  
  mockHistory.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  
  employmentHistory.value = mockHistory;
  
  stats.value = {
    totalRecords: mockHistory.length,
    active: mockHistory.filter(h => h.employment_status === 'active').length,
    probation: mockHistory.filter(h => h.employment_status === 'probation').length,
    inactive: mockHistory.filter(h => h.employment_status === 'inactive').length
  };
};

const loadData = async () => {
  try {
    loading.value = true;
    
    generateMockData();
    
    try {
      const response = await axiosClient.get('/employment-histories');
      if (response.data && response.data.length > 0) {
        employmentHistory.value = response.data;
        
        stats.value = {
          totalRecords: response.data.length,
          active: response.data.filter(h => h.employment_status === 'active').length,
          probation: response.data.filter(h => h.employment_status === 'probation').length,
          inactive: response.data.filter(h => h.employment_status === 'inactive').length
        };
      }
    } catch (apiError) {
      console.log('API unavailable, using mock data');
    }
    
  } catch (error) {
    console.error('Error loading employment history:', error);
  } finally {
    loading.value = false;
  }
};

const loadEmployees = async () => {
  try {
    const response = await axiosClient.get('/employees');
    if (response.data && response.data.length > 0) {
      employeeOptions.value = [
        { label: 'Tất cả nhân viên', value: '' },
        ...response.data.map(emp => ({
          value: emp.id,
          label: emp.full_name
        }))
      ];
    }
  } catch (error) {
    console.log('Using mock employee options');
  }
};

const applyFilters = async () => {
  console.log('Filters applied:', filters.value);
};

onMounted(async () => {
  await Promise.all([loadData(), loadEmployees()]);
});
</script>
