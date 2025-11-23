<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Quản lý Chấm công</h1>
      <p class="text-muted-foreground mt-1">Theo dõi và báo cáo chấm công nhân viên</p>
    </div>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Có mặt</p>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{{ todaySummary.present }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Vắng mặt</p>
          <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{{ todaySummary.absent }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Đi muộn</p>
          <p class="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{{ todaySummary.late }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Nửa ngày</p>
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{{ todaySummary.halfDay }}</p>
        </div>
      </BaseCard>
    </div>
    
    <!-- Filters -->
    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseInput
          v-model="filters.startDate"
          type="date"
          label="Từ ngày"
          data-testid="input-start-date"
        />
        <BaseInput
          v-model="filters.endDate"
          type="date"
          label="Đến ngày"
          data-testid="input-end-date"
        />
        <BaseSelect
          v-model="filters.status"
          label="Trạng thái"
          :options="statusOptions"
          data-testid="select-status"
        />
        <div class="flex items-end">
          <BaseButton
            variant="outline"
            @click="applyFilters"
            data-testid="button-apply-filters"
          >
            Áp dụng
          </BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <!-- Attendance Table -->
    <BaseCard title="Bảng chấm công">
      <BaseTable
        :columns="columns"
        :data="records"
        data-testid="table-attendance"
      >
        <template #cell-employee="{ item }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {{ getInitials(item.employee?.full_name || '') }}
            </div>
            <span class="font-medium">{{ item.employee?.full_name }}</span>
          </div>
        </template>
        
        <template #cell-check_in_time="{ value }">
          <span class="text-sm">{{ formatTime(value) }}</span>
        </template>
        
        <template #cell-check_out_time="{ value }">
          <span class="text-sm">{{ formatTime(value) }}</span>
        </template>
        
        <template #cell-total_work_hours="{ value }">
          <span class="text-sm font-medium">{{ value || 0 }}h</span>
        </template>
        
        <template #cell-status="{ value }">
          <BaseBadge :variant="getStatusVariant(value)">
            {{ getStatusText(value) }}
          </BaseBadge>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseTable from '../components/BaseTable.vue';
import type { AttendanceRecord } from '../types';

const todaySummary = ref({
  present: 0,
  absent: 0,
  late: 0,
  halfDay: 0
});

const filters = ref({
  startDate: '',
  endDate: '',
  status: ''
});

const records = ref<AttendanceRecord[]>([]);

const columns = [
  { key: 'employee', label: 'Nhân viên' },
  { key: 'record_date', label: 'Ngày' },
  { key: 'check_in_time', label: 'Giờ vào' },
  { key: 'check_out_time', label: 'Giờ ra' },
  { key: 'total_work_hours', label: 'Tổng giờ' },
  { key: 'status', label: 'Trạng thái' },
];

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Có mặt', value: 'present' },
  { label: 'Vắng', value: 'absent' },
  { label: 'Đi muộn', value: 'late' },
  { label: 'Nửa ngày', value: 'half_day' },
];

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (time: string | undefined) => {
  if (!time) return '-';
  return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, any> = {
    present: 'success',
    late: 'warning',
    absent: 'error',
    half_day: 'info'
  };
  return variants[status] || 'default';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    present: 'Có mặt',
    absent: 'Vắng',
    late: 'Đi muộn',
    half_day: 'Nửa ngày',
    holiday: 'Nghỉ lễ'
  };
  return texts[status] || status;
};

const applyFilters = () => {
  console.log('Applying filters:', filters.value);
};

onMounted(() => {
  // Mock data
  todaySummary.value = {
    present: 142,
    absent: 5,
    late: 9,
    halfDay: 0
  };
  
  records.value = [
    {
      id: 1,
      employee_id: 1,
      employee: { full_name: 'Nguyễn Văn A' } as any,
      record_date: '2025-01-13',
      check_in_time: '2025-01-13T08:00:00',
      check_out_time: '2025-01-13T17:30:00',
      total_work_hours: 8.5,
      status: 'present'
    },
    {
      id: 2,
      employee_id: 2,
      employee: { full_name: 'Trần Thị B' } as any,
      record_date: '2025-01-13',
      check_in_time: '2025-01-13T08:15:00',
      check_out_time: '2025-01-13T17:20:00',
      total_work_hours: 8,
      late_minutes: 15,
      status: 'late'
    }
  ] as any;
});
</script>
