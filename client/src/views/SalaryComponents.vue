<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Thành phần lương</h1>
        <p class="text-muted-foreground mt-1">Danh sách các thành phần lương</p>
      </div>
      <BaseButton @click="showCreateModal = true">+ Thêm thành phần</BaseButton>
    </div>

    <BaseCard>
      <BaseTable
        :columns="[
          { key: 'code', label: 'Mã' },
          { key: 'name', label: 'Tên thành phần' },
          { key: 'type', label: 'Loại' },
          { key: 'category', label: 'Danh mục' },
          { key: 'is_active', label: 'Trạng thái' }
        ]"
        :data="salaryComponents"
      >
        <template #cell-type="{ item }">
          <span class="text-sm">{{ item.type === 'earning' ? 'Thu nhập' : 'Khấu trừ' }}</span>
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

    <BaseModal v-model="showCreateModal" title="Thêm thành phần lương">
      <div class="space-y-4">
        <BaseInput v-model="form.code" label="Mã" required />
        <BaseInput v-model="form.name" label="Tên thành phần" required />
        <BaseSelect
          v-model="form.type"
          label="Loại"
          :options="[
            { value: 'earning', label: 'Thu nhập' },
            { value: 'deduction', label: 'Khấu trừ' }
          ]"
          required
        />
        <BaseSelect
          v-model="form.category"
          label="Danh mục"
          :options="[
            { value: 'basic', label: 'Lương cơ bản' },
            { value: 'allowance', label: 'Phụ cấp' },
            { value: 'bonus', label: 'Thưởng' },
            { value: 'tax', label: 'Thuế' },
            { value: 'insurance', label: 'Bảo hiểm' },
            { value: 'other', label: 'Khác' }
          ]"
          required
        />
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="form.is_taxable" class="rounded" />
          <label>Tính thuế</label>
        </div>
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
import { salaryService } from '../services/salaryService';

const salaryComponents = ref([]);
const showCreateModal = ref(false);
const form = ref({
  code: '',
  name: '',
  type: '',
  category: '',
  is_taxable: false,
  is_active: true
});

const loadData = async () => {
  try {
    const response = await salaryService.getComponents();
    salaryComponents.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading salary components:', err);
    salaryComponents.value = [];
  }
};

const saveItem = async () => {
  try {
    if (form.value.id) {
      await salaryService.updateComponent(form.value.id, form.value);
    } else {
      await salaryService.createComponent(form.value);
    }
    showCreateModal.value = false;
    form.value = {
      code: '',
      name: '',
      type: '',
      category: '',
      is_taxable: false,
      is_active: true
    };
    await loadData();
  } catch (err) {
    console.error('Error saving salary component:', err);
  }
};

const editItem = (item) => {
  form.value = { ...item };
  showCreateModal.value = true;
};

const deleteItem = async (item) => {
  try {
    await salaryService.deleteComponent(item.id);
    await loadData();
  } catch (err) {
    console.error('Error deleting salary component:', err);
  }
};

onMounted(async () => {
  await loadData();
});
</script>
