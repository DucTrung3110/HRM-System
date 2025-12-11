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
import { workScheduleService } from '../services/workScheduleService';
import { employeeService } from '../services/employeeService';
import { workShiftService } from '../services/workShiftService';

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

const loadData = async () => {
  try {
    const response = await workScheduleService.getAll(filters.value);
    workSchedules.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading work schedules:', err);
    workSchedules.value = [];
  }
};

const loadEmployees = async () => {
  try {
    const response = await employeeService.getAll();
    const employees = response?.data || response || [];
    employeeOptions.value = employees.map((emp) => ({
      value: emp.id,
      label: emp.full_name
    }));
  } catch (err) {
    console.error('Error loading employees:', err);
    employeeOptions.value = [];
  }
};

const loadShifts = async () => {
  try {
    const response = await workShiftService.getAll();
    const shifts = response?.data || response || [];
    shiftOptions.value = shifts.map((shift) => ({
      value: shift.id,
      label: shift.name
    }));
  } catch (err) {
    console.error('Error loading shifts:', err);
    shiftOptions.value = [];
  }
};

const saveItem = async () => {
  try {
    if (form.value.id) {
      await workScheduleService.update(form.value.id, form.value);
    } else {
      await workScheduleService.create(form.value);
    }
    showCreateModal.value = false;
    form.value = { employee_id: '', work_date: '', shift_id: '' };
    await loadData();
  } catch (err) {
    console.error('Error saving work schedule:', err);
  }
};

const applyFilters = async () => {
  await loadData();
};

onMounted(async () => {
  await Promise.all([loadData(), loadEmployees(), loadShifts()]);
});
</script>
