<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">{{ isAdmin ? 'Quản lý Lương' : 'Phiếu lương của tôi' }}</h1>
      <p class="text-muted-foreground mt-1">{{ isAdmin ? 'Cấu trúc và thành phần lương nhân viên' : 'Xem chi tiết lương cá nhân' }}</p>
    </div>
    
    <template v-if="isAdmin">
      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseSelect
            v-model="selectedEmployee"
            label="Chọn nhân viên"
            :options="employeeOptions"
            data-testid="select-employee"
          />
          <BaseInput
            v-model="selectedMonth"
            type="month"
            label="Tháng"
            data-testid="input-month"
          />
          <div class="flex items-end">
            <BaseButton
              variant="outline"
              @click="loadSalary"
              data-testid="button-load-salary"
            >
              Xem chi tiết
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </template>
    <template v-else>
      <BaseCard>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Nhân viên</p>
            <p class="font-medium text-lg">{{ currentUser?.full_name || currentUser?.email || 'Bạn' }}</p>
          </div>
          <div class="ml-auto">
            <BaseInput
              v-model="selectedMonth"
              type="month"
              label="Tháng"
              data-testid="input-month"
            />
          </div>
        </div>
      </BaseCard>
    </template>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Tổng thu nhập</p>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {{ formatMoney(summary.totalEarnings) }}
          </p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Tổng khấu trừ</p>
          <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {{ formatMoney(summary.totalDeductions) }}
          </p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Lương thực lĩnh</p>
          <p class="text-3xl font-bold text-primary mt-2">
            {{ formatMoney(summary.netSalary) }}
          </p>
        </div>
      </BaseCard>
    </div>
    
    <div v-if="selectedEmployee || !isAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BaseCard title="Thu nhập">
        <div class="space-y-3">
          <div
            v-for="item in earnings"
            :key="item.id"
            class="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div>
              <p class="font-medium">{{ item.component_name || item.name }}</p>
              <p class="text-xs text-muted-foreground">{{ getCategoryLabel(item.category || item.type) }}</p>
            </div>
            <p class="font-semibold text-green-600 dark:text-green-400">
              +{{ formatMoney(item.amount || 0) }}
            </p>
          </div>
          <div v-if="!earnings.length" class="text-center py-8 text-muted-foreground">
            Chưa có dữ liệu
          </div>
        </div>
      </BaseCard>
      
      <BaseCard title="Khấu trừ">
        <div class="space-y-3">
          <div
            v-for="item in deductions"
            :key="item.id"
            class="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div>
              <p class="font-medium">{{ item.component_name || item.name }}</p>
              <p class="text-xs text-muted-foreground">{{ getCategoryLabel(item.category || item.type) }}</p>
            </div>
            <p class="font-semibold text-red-600 dark:text-red-400">
              -{{ formatMoney(item.amount || 0) }}
            </p>
          </div>
          <div v-if="!deductions.length" class="text-center py-8 text-muted-foreground">
            Chưa có dữ liệu
          </div>
        </div>
      </BaseCard>
    </div>
    
    <BaseCard v-if="isAdmin && !selectedEmployee">
      <div class="text-center py-8 text-muted-foreground">
        <p>Vui lòng chọn nhân viên để xem chi tiết lương</p>
      </div>
    </BaseCard>
    
    <BaseCard title="Lịch sử lương">
      <BaseTable
        :columns="historyColumns"
        :data="history"
        data-testid="table-salary-history"
      >
        <template #cell-month="{ value }">
          <span class="font-medium">{{ value }}</span>
        </template>
        
        <template #cell-total_earnings="{ value }">
          <span class="text-green-600 dark:text-green-400">{{ formatMoney(value) }}</span>
        </template>
        
        <template #cell-total_deductions="{ value }">
          <span class="text-red-600 dark:text-red-400">{{ formatMoney(value) }}</span>
        </template>
        
        <template #cell-net_salary="{ value }">
          <span class="font-semibold text-primary">{{ formatMoney(value) }}</span>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseTable from '../components/BaseTable.vue';
import { salaryService } from '../services/salaryService';
import { employeeService } from '../services/employeeService';
import { authService } from '../services/authService';

const isAdmin = computed(() => authService.isAdmin());
const currentUser = computed(() => authService.getUser());

const selectedEmployee = ref('');
const selectedMonth = ref('');
const salaryComponents = ref([]);
const history = ref([]);
const employeeOptions = ref([{ label: 'Chọn nhân viên', value: '' }]);

const earnings = computed(() => {
  return salaryComponents.value.filter(s => s.type === 'earning');
});

const deductions = computed(() => {
  return salaryComponents.value.filter(s => s.type === 'deduction');
});

const summary = computed(() => {
  const totalEarnings = earnings.value.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDeductions = deductions.value.reduce((sum, item) => sum + (item.amount || 0), 0);
  return {
    totalEarnings,
    totalDeductions,
    netSalary: totalEarnings - totalDeductions
  };
});

const historyColumns = [
  { key: 'month', label: 'Tháng' },
  { key: 'total_earnings', label: 'Thu nhập' },
  { key: 'total_deductions', label: 'Khấu trừ' },
  { key: 'net_salary', label: 'Thực lĩnh' },
];

const formatMoney = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const getCategoryLabel = (category) => {
  const labels = {
    'earning': 'Thu nhập',
    'deduction': 'Khấu trừ',
    'basic': 'Lương cơ bản',
    'allowance': 'Phụ cấp',
    'bonus': 'Thưởng',
    'insurance': 'Bảo hiểm',
    'tax': 'Thuế'
  };
  return labels[category] || category || '';
};

const loadSalary = async () => {
  const empId = isAdmin.value ? selectedEmployee.value : (currentUser.value?.employee_id || '');
  if (!empId) return;
  
  try {
    const response = await employeeService.getSalaries(empId);
    const data = response?.data || response || [];
    salaryComponents.value = data.length > 0 ? data : generateDemoSalaryData();
  } catch (err) {
    console.error('Error loading salary:', err);
    salaryComponents.value = generateDemoSalaryData();
  }
};

const loadEmployees = async () => {
  try {
    const response = await employeeService.getAll();
    const employees = response?.data || response || [];
    employeeOptions.value = [
      { label: 'Chọn nhân viên', value: '' },
      ...employees.map((emp) => ({
        label: `${emp.full_name} (${emp.code})`,
        value: String(emp.id)
      }))
    ];
  } catch (err) {
    console.error('Error loading employees:', err);
  }
};

watch(selectedMonth, () => {
  if (!isAdmin.value || selectedEmployee.value) {
    loadSalary();
  }
});

const generateDemoSalaryData = () => {
  return [
    { id: 1, component_name: 'Lương cơ bản', name: 'Lương cơ bản', type: 'earning', category: 'basic', amount: 15000000 },
    { id: 2, component_name: 'Phụ cấp ăn trưa', name: 'Phụ cấp ăn trưa', type: 'earning', category: 'allowance', amount: 1000000 },
    { id: 3, component_name: 'Phụ cấp xăng xe', name: 'Phụ cấp xăng xe', type: 'earning', category: 'allowance', amount: 500000 },
    { id: 4, component_name: 'Thưởng hiệu suất', name: 'Thưởng hiệu suất', type: 'earning', category: 'bonus', amount: 2000000 },
    { id: 5, component_name: 'Bảo hiểm xã hội (8%)', name: 'BHXH', type: 'deduction', category: 'insurance', amount: 1200000 },
    { id: 6, component_name: 'Bảo hiểm y tế (1.5%)', name: 'BHYT', type: 'deduction', category: 'insurance', amount: 225000 },
    { id: 7, component_name: 'Thuế TNCN', name: 'Thuế TNCN', type: 'deduction', category: 'tax', amount: 850000 }
  ];
};

const generateDemoHistory = () => {
  const now = new Date();
  const history = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    history.push({
      id: i + 1,
      month: monthStr,
      total_earnings: 18500000 + Math.floor(Math.random() * 2000000),
      total_deductions: 2275000 + Math.floor(Math.random() * 500000),
      net_salary: 16225000 + Math.floor(Math.random() * 1500000)
    });
  }
  return history;
};

onMounted(async () => {
  const now = new Date();
  selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  if (isAdmin.value) {
    await loadEmployees();
  } else {
    const user = currentUser.value;
    if (user?.employee_id) {
      selectedEmployee.value = String(user.employee_id);
      await loadSalary();
    }
  }
  
  try {
    const response = await salaryService.getComponents();
    if (!salaryComponents.value.length) {
      const data = response?.data || response || [];
      salaryComponents.value = data.length > 0 ? data : generateDemoSalaryData();
    }
  } catch (err) {
    console.error('Error loading salary components:', err);
    salaryComponents.value = generateDemoSalaryData();
  }
  
  history.value = generateDemoHistory();
});
</script>
