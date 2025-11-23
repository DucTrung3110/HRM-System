<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Ca làm việc</h1>
        <p class="text-muted-foreground mt-1">Danh sách các ca làm việc</p>
      </div>
      <BaseButton @click="showCreateModal = true">+ Thêm ca</BaseButton>
    </div>

    <BaseCard>
      <BaseTable
        :columns="[
          { key: 'code', label: 'Mã ca' },
          { key: 'name', label: 'Tên ca' },
          { key: 'start_time', label: 'Giờ bắt đầu' },
          { key: 'end_time', label: 'Giờ kết thúc' },
          { key: 'break_minutes', label: 'Giờ nghỉ (phút)' },
          { key: 'is_active', label: 'Trạng thái' }
        ]"
        :data="workShifts"
      >
        <template #cell-is_active="{ item }">
          <BaseBadge :variant="item.is_active ? 'success' : 'secondary'">
            {{ item.is_active ? 'Hoạt động' : 'Không hoạt động' }}
          </BaseBadge>
        </template>
        <template #actions="{ item }">
          <div class="flex gap-2">
            <button @click="editItem(item)" class="p-1 rounded hover-elevate">✏️</button>
            <button @click="deleteItem(item)" class="p-1 rounded hover-elevate text-destructive">🗑️</button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal v-model="showCreateModal" title="Thêm ca làm việc">
      <div class="space-y-4">
        <BaseInput v-model="form.code" label="Mã ca" required />
        <BaseInput v-model="form.name" label="Tên ca" required />
        <BaseInput v-model="form.start_time" type="time" label="Giờ bắt đầu" required />
        <BaseInput v-model="form.end_time" type="time" label="Giờ kết thúc" required />
        <BaseInput v-model.number="form.break_minutes" type="number" label="Giờ nghỉ (phút)" />
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="form.is_active" class="rounded" />
          <label>Hoạt động</label>
        </div>
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

const workShifts = ref([]);
const showCreateModal = ref(false);
const form = ref({
  code: '',
  name: '',
  start_time: '',
  end_time: '',
  break_minutes: 0,
  is_active: true
});

const saveItem = async () => {
  workShifts.value.push({ ...form.value, id: Date.now() });
  showCreateModal.value = false;
  form.value = { code: '', name: '', start_time: '', end_time: '', break_minutes: 0, is_active: true };
};

const editItem = (item) => {
  form.value = { ...item };
  showCreateModal.value = true;
};

const deleteItem = (item) => {
  workShifts.value = workShifts.value.filter(x => x.id !== item.id);
};

onMounted(() => {
  // Mock data for UI preview
  workShifts.value = [
    { id: 1, code: 'SFT001', name: 'Ca sáng', start_time: '08:00', end_time: '12:00', break_minutes: 0, total_hours: 4, is_default: true, is_active: true },
    { id: 2, code: 'SFT002', name: 'Ca chiều', start_time: '13:00', end_time: '17:00', break_minutes: 0, total_hours: 4, is_default: false, is_active: true },
    { id: 3, code: 'SFT003', name: 'Ca hành chính', start_time: '08:00', end_time: '17:00', break_minutes: 60, total_hours: 8, is_default: false, is_active: true },
    { id: 4, code: 'SFT004', name: 'Ca đêm', start_time: '22:00', end_time: '06:00', break_minutes: 30, total_hours: 7.5, is_default: false, is_active: true },
    { id: 5, code: 'SFT005', name: 'Ca linh hoạt', start_time: '09:00', end_time: '18:00', break_minutes: 60, total_hours: 8, is_default: false, is_active: false },
  ];
});
</script>