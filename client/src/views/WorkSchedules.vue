<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Lên lịch làm việc</h1>
        <p class="text-muted-foreground mt-1">Quản lý lịch làm việc của nhân viên</p>
      </div>
      <BaseButton @click="showCreateModal = true">+ Lên lịch</BaseButton>
    </div>

    <BaseCard>
      <div class="flex flex-wrap gap-3 mb-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <BaseSelect
            v-model="filters.employee"
            :options="employeeOptions"
            placeholder="Chọn nhân viên"
          />
        </div>
        <div class="flex-1 min-w-[150px]">
          <BaseInput
            v-model="filters.startDate"
            type="date"
            label="Từ ngày"
          />
        </div>
        <div class="flex-1 min-w-[150px]">
          <BaseInput
            v-model="filters.endDate"
            type="date"
            label="Đến ngày"
          />
        </div>
        <BaseButton @click="applyFilters" size="sm" class="px-6 h-[42px]">Tìm kiếm</BaseButton>
      </div>

      <BaseTable
        :columns="[
          { key: 'employee_id', label: 'Nhân viên' },
          { key: 'work_date', label: 'Ngày làm' },
          { key: 'shift_id', label: 'Ca' },
          { key: 'status', label: 'Trạng thái' }
        ]"
        :data="workSchedules"
      >
        <template #cell-status="{ item }">
          <BaseBadge :variant="getStatusVariant(item.status)">
            {{ getStatusText(item.status) }}
          </BaseBadge>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal v-model="showCreateModal" title="Lên lịch làm việc">
      <div class="space-y-4">
        <BaseSelect
          v-model="form.employee_id"
          :options="employeeOptions"
          label="Nhân viên"
          required
        />
        <BaseInput v-model="form.work_date" type="date" label="Ngày làm" required />
        <BaseSelect
          v-model="form.shift_id"
          :options="shiftOptions"
          label="Ca"
          required
        />
        <BaseButton @click="saveItem" class="w-full">Lưu</BaseButton>
      </div>
    </BaseModal>
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

const workSchedules = ref([]);
const employeeOptions = ref([]);
const shiftOptions = ref([]);
const showCreateModal = ref(false);

const filters = ref({
  employee: '',
  startDate: '',
  endDate: ''
});

const form = ref({
  employee_id: '',
  work_date: '',
  shift_id: ''
});

const getStatusText = (status) => {
  const statuses = {
    scheduled: 'Đã lên lịch',
    present: 'Có mặt',
    absent: 'Vắng mặt',
    late: 'Muộn',
    half_day: 'Nửa ngày'
  };
  return statuses[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    scheduled: 'default',
    present: 'success',
    absent: 'destructive',
    late: 'warning',
    half_day: 'secondary'
  };
  return variants[status] || 'default';
};

const saveItem = async () => {
  workSchedules.value.push({ ...form.value, id: Date.now() });
  showCreateModal.value = false;
};

const applyFilters = () => {
  // Implement filtering
};

onMounted(() => {
  // Mock data for UI preview
  workSchedules.value = [
    { id: 1, employee_id: 1, employee: { full_name: 'Nguyễn Văn A' }, work_date: '2025-01-24', shift_id: 3, shift: { name: 'Toàn ngày' }, status: 'scheduled' },
    { id: 2, employee_id: 2, employee: { full_name: 'Trần Thị B' }, work_date: '2025-01-24', shift_id: 1, shift: { name: 'Sáng' }, status: 'present' },
    { id: 3, employee_id: 3, employee: { full_name: 'Lê Văn C' }, work_date: '2025-01-24', shift_id: 2, shift: { name: 'Chiều' }, status: 'absent' },
    { id: 4, employee_id: 1, employee: { full_name: 'Nguyễn Văn A' }, work_date: '2025-01-25', shift_id: 3, shift: { name: 'Toàn ngày' }, status: 'scheduled' },
    { id: 5, employee_id: 2, employee: { full_name: 'Trần Thị B' }, work_date: '2025-01-25', shift_id: 1, shift: { name: 'Sáng' }, status: 'late' },
    { id: 6, employee_id: 3, employee: { full_name: 'Lê Văn C' }, work_date: '2025-01-25', shift_id: 2, shift: { name: 'Chiều' }, status: 'half_day' },
  ];
  
  employeeOptions.value = [
    { value: 1, label: 'Nguyễn Văn A' },
    { value: 2, label: 'Trần Thị B' },
    { value: 3, label: 'Lê Văn C' },
  ];
  
  shiftOptions.value = [
    { value: 1, label: 'Sáng' },
    { value: 2, label: 'Chiều' },
    { value: 3, label: 'Toàn ngày' },
    { value: 4, label: 'Ca đêm' },
  ];
});
</script>
