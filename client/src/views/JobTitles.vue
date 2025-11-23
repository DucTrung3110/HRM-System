<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Chức danh</h1>
        <p class="text-muted-foreground mt-1">Danh sách các chức danh công việc</p>
      </div>
      <BaseButton @click="showCreateModal = true">+ Thêm chức danh</BaseButton>
    </div>

    <BaseCard>
      <BaseTable
        :columns="[
          { key: 'code', label: 'Mã' },
          { key: 'name', label: 'Tên chức danh' },
          { key: 'job_level', label: 'Cấp độ' },
          { key: 'is_active', label: 'Trạng thái' }
        ]"
        :data="jobTitles"
      >
        <template #cell-job_level="{ item }">
          <span class="text-sm">{{ getLevelText(item.job_level) }}</span>
        </template>
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

    <BaseModal v-model="showCreateModal" title="Thêm chức danh">
      <div class="space-y-4">
        <BaseInput v-model="form.code" label="Mã chức danh" required />
        <BaseInput v-model="form.name" label="Tên chức danh" required />
        <BaseSelect
          v-model="form.job_level"
          label="Cấp độ"
          :options="[
            { value: 'entry', label: 'Mới vào' },
            { value: 'junior', label: 'Junior' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead' },
            { value: 'manager', label: 'Manager' },
            { value: 'director', label: 'Director' },
            { value: 'executive', label: 'Executive' }
          ]"
          required
        />
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

const jobTitles = ref([]);
const showCreateModal = ref(false);
const form = ref({
  code: '',
  name: '',
  job_level: '',
  is_active: true
});

const getLevelText = (level) => {
  const levels = {
    entry: 'Mới vào',
    junior: 'Junior',
    senior: 'Senior',
    lead: 'Lead',
    manager: 'Manager',
    director: 'Director',
    executive: 'Executive'
  };
  return levels[level] || level;
};

const saveItem = async () => {
  // API call would go here
  jobTitles.value.push({ ...form.value, id: Date.now() });
  showCreateModal.value = false;
  form.value = { code: '', name: '', job_level: '', is_active: true };
};

const editItem = (item) => {
  form.value = { ...item };
  showCreateModal.value = true;
};

const deleteItem = (item) => {
  jobTitles.value = jobTitles.value.filter(x => x.id !== item.id);
};

onMounted(() => {
  // Mock data for UI preview
  jobTitles.value = [
    { id: 1, code: 'JT001', name: 'Senior Developer', job_level: 'senior', is_active: true },
    { id: 2, code: 'JT002', name: 'Project Manager', job_level: 'manager', is_active: true },
    { id: 3, code: 'JT003', name: 'Business Analyst', job_level: 'junior', is_active: true },
    { id: 4, code: 'JT004', name: 'QA Engineer', job_level: 'senior', is_active: true },
    { id: 5, code: 'JT005', name: 'UI/UX Designer', job_level: 'lead', is_active: false },
  ];
});
</script>
