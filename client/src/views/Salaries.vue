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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseTable from '../components/BaseTable.vue';
import type { EmployeeSalary } from '../types';

const selectedEmployee = ref('');
const selectedMonth = ref('');
const salaryComponents = ref<EmployeeSalary[]>([]);
const history = ref<any[]>([]);

const employeeOptions = [
  { label: 'Chọn nhân viên', value: '' },
  { label: 'Nguyễn Văn A (EMP001)', value: '1' },
  { label: 'Trần Thị B (EMP002)', value: '2' },
];

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

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const loadSalary = () => {
  console.log('Load salary for:', selectedEmployee.value, selectedMonth.value);
};

onMounted(() => {
  // Mock data
  salaryComponents.value = [
    {
      id: 1,
      employee_id: 1,
      salary_component_id: 1,
      salary_component: {
        id: 1,
        code: 'BASIC',
        name: 'Lương cơ bản',
        type: 'earning',
        category: 'basic',
        is_taxable: true,
        is_active: true
      },
      amount: 15000000,
      effective_date: '2025-01-01'
    },
    {
      id: 2,
      employee_id: 1,
      salary_component_id: 2,
      salary_component: {
        id: 2,
        code: 'ALLOWANCE',
        name: 'Phụ cấp ăn trưa',
        type: 'earning',
        category: 'allowance',
        is_taxable: false,
        is_active: true
      },
      amount: 1000000,
      effective_date: '2025-01-01'
    },
    {
      id: 3,
      employee_id: 1,
      salary_component_id: 3,
      salary_component: {
        id: 3,
        code: 'TAX',
        name: 'Thuế thu nhập cá nhân',
        type: 'deduction',
        category: 'tax',
        is_taxable: false,
        is_active: true
      },
      amount: 1500000,
      effective_date: '2025-01-01'
    },
    {
      id: 4,
      employee_id: 1,
      salary_component_id: 4,
      salary_component: {
        id: 4,
        code: 'INSURANCE',
        name: 'Bảo hiểm xã hội',
        type: 'deduction',
        category: 'insurance',
        is_taxable: false,
        is_active: true
      },
      amount: 1200000,
      effective_date: '2025-01-01'
    }
  ] as any;
  
  history.value = [
    { month: '12/2024', total_earnings: 16000000, total_deductions: 2700000, net_salary: 13300000 },
    { month: '11/2024', total_earnings: 16000000, total_deductions: 2700000, net_salary: 13300000 },
    { month: '10/2024', total_earnings: 16000000, total_deductions: 2700000, net_salary: 13300000 },
  ];
});
</script>
