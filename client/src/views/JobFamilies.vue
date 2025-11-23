<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Nhóm chức danh</h1>
        <p class="text-muted-foreground mt-1">Danh sách các nhóm chức danh</p>
      </div>
      <BaseButton @click="showCreateModal = true">+ Thêm nhóm</BaseButton>
    </div>

    <BaseCard>
      <BaseTable
        :columns="[
          { key: 'code', label: 'Mã' },
          { key: 'name', label: 'Tên nhóm' },
          { key: 'description', label: 'Mô tả' },
          { key: 'is_active', label: 'Trạng thái' }
        ]"
        :data="jobFamilies"
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

    <BaseModal v-model="showCreateModal" title="Thêm nhóm chức danh">
      <div class="space-y-4">
        <BaseInput v-model="form.code" label="Mã nhóm" required />
        <BaseInput v-model="form.name" label="Tên nhóm" required />
        <BaseInput v-model="form.description" label="Mô tả" />
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
import BaseBadge from '../components/BaseBadge.vue';

const jobFamilies = ref([]);
const showCreateModal = ref(false);
const form = ref({
  code: '',
  name: '',
  description: '',
  is_active: true
});

const saveItem = async () => {
  jobFamilies.value.push({ ...form.value, id: Date.now() });
  showCreateModal.value = false;
  form.value = { code: '', name: '', description: '', is_active: true };
};

const editItem = (item) => {
  form.value = { ...item };
  showCreateModal.value = true;
};

const deleteItem = (item) => {
  jobFamilies.value = jobFamilies.value.filter(x => x.id !== item.id);
};

onMounted(() => {
  // Mock data for UI preview
  jobFamilies.value = [
    { id: 1, code: 'JF001', name: 'IT & Technology', description: 'All IT-related positions', is_active: true },
    { id: 2, code: 'JF002', name: 'Sales & Marketing', description: 'Sales and marketing team', is_active: true },
    { id: 3, code: 'JF003', name: 'Human Resources', description: 'HR department roles', is_active: true },
    { id: 4, code: 'JF004', name: 'Finance & Accounting', description: 'Finance team', is_active: true },
    { id: 5, code: 'JF005', name: 'Operations', description: 'Operations department', is_active: true },
  ];
});
</script>
