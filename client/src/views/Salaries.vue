<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Quản lý Lương</h1>
      <p class="text-muted-foreground mt-1">Cấu trúc và thành phần lương nhân viên</p>
    </div>
    
    <!-- Employee Selector -->
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
    
    <!-- Salary Summary -->
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
    
    <!-- Salary Components -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BaseCard title="Thu nhập">
        <div class="space-y-3">
          <div
            v-for="item in earnings"
            :key="item.id"
            class="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div>
              <p class="font-medium">{{ item.salary_component?.name }}</p>
              <p class="text-xs text-muted-foreground">{{ item.salary_component?.category }}</p>
            </div>
            <p class="font-semibold text-green-600 dark:text-green-400">
              +{{ formatMoney(item.amount) }}
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
              <p class="font-medium">{{ item.salary_component?.name }}</p>
              <p class="text-xs text-muted-foreground">{{ item.salary_component?.category }}</p>
            </div>
            <p class="font-semibold text-red-600 dark:text-red-400">
              -{{ formatMoney(item.amount) }}
            </p>
          </div>
          <div v-if="!deductions.length" class="text-center py-8 text-muted-foreground">
            Chưa có dữ liệu
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- Salary History -->
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
import { ref, computed, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseTable from '../components/BaseTable.vue';
import { salaryService } from '../services/salaryService';
import { employeeService } from '../services/employeeService';

const selectedEmployee = ref('');
const selectedMonth = ref('');
const salaryComponents = ref([]);
const history = ref([]);
const employeeOptions = ref([{ label: 'Chọn nhân viên', value: '' }]);

const earnings = computed(() => {
  return salaryComponents.value.filter(s => s.salary_component?.type === 'earning');
});

const deductions = computed(() => {
  return salaryComponents.value.filter(s => s.salary_component?.type === 'deduction');
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

const loadSalary = async () => {
  if (!selectedEmployee.value) return;
  try {
    const response = await employeeService.getSalaries(selectedEmployee.value);
    salaryComponents.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading salary:', err);
    salaryComponents.value = [];
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

onMounted(async () => {
  await loadEmployees();
  try {
    const response = await salaryService.getComponents();
    salaryComponents.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading salary components:', err);
    salaryComponents.value = [];
  }
  history.value = [];
});
</script>
