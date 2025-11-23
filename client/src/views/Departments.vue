<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Phòng ban</h1>
        <p class="text-muted-foreground mt-1">Cấu trúc tổ chức và phân cấp phòng ban</p>
      </div>
      <BaseButton
        @click="showCreateModal = true"
        data-testid="button-create-department"
      >
        + Thêm phòng ban
      </BaseButton>
    </div>

    <!-- Department Tree View -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard title="Cấu trúc phòng ban" class="lg:col-span-1">
        <div class="space-y-2">
          <div
            v-for="dept in departments"
            :key="dept.id"
            @click="selectDepartment(dept)"
            :class="['p-3 rounded-lg cursor-pointer transition-colors hover-elevate',
                     selectedDept?.id === dept.id ? 'bg-primary/10 border-l-4 border-primary' : '']"
            :data-testid="`dept-item-${dept.id}`"
          >
            <div class="flex items-center gap-2">
              <IconBuilding class="w-5 h-5" />
              <div class="flex-1">
                <p class="font-medium text-sm">{{ dept.name }}</p>
                <p class="text-xs text-muted-foreground">{{ dept.code }}</p>
              </div>
              <BaseBadge size="sm">{{ dept.employees?.length || 0 }}</BaseBadge>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Chi tiết phòng ban" class="lg:col-span-2">
        <div v-if="selectedDept" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Mã phòng ban</p>
              <p class="font-medium">{{ selectedDept.code }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Tên phòng ban</p>
              <p class="font-medium">{{ selectedDept.name }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Quản lý</p>
              <p class="font-medium">{{ selectedDept.manager?.full_name || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Số nhân viên</p>
              <p class="font-medium">{{ selectedDept.employees?.length || 0 }}</p>
            </div>
          </div>

          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-3">Nhân viên trong phòng ban</h3>
            <div class="space-y-2">
              <div
                v-for="emp in selectedDept.employees"
                :key="emp.id"
                class="flex items-center gap-3 p-2 rounded-lg hover-elevate"
              >
                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {{ getInitials(emp.full_name) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ emp.full_name }}</p>
                  <p class="text-xs text-muted-foreground">{{ emp.job_title?.name }}</p>
                </div>
              </div>
              <div v-if="!selectedDept.employees?.length" class="text-center py-8 text-muted-foreground">
                Chưa có nhân viên
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-muted-foreground">
          Chọn một phòng ban để xem chi tiết
        </div>
      </BaseCard>
    </div>

    <!-- Create Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Thêm phòng ban mới"
      data-testid="modal-create-department"
    >
      <div class="space-y-4">
        <BaseInput label="Mã phòng ban" required data-testid="input-dept-code" />
        <BaseInput label="Tên phòng ban" required data-testid="input-dept-name" />
        <BaseSelect label="Phòng ban cha" :options="parentOptions" data-testid="select-parent-dept" />
        <BaseSelect label="Quản lý" :options="managerOptions" data-testid="select-manager" />
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showCreateModal = false">Hủy</BaseButton>
        <BaseButton @click="handleCreate">Tạo mới</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseModal from '../components/BaseModal.vue';
import IconBuilding from '../components/IconBuilding.vue';
import type { Department } from '../types';

const showCreateModal = ref(false);
const departments = ref<Department[]>([]);
const selectedDept = ref<Department | null>(null);

const parentOptions = ref([
  { label: 'Không có', value: '' }
]);

const managerOptions = ref([
  { label: 'Chọn quản lý', value: '' }
]);

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const selectDepartment = (dept: Department) => {
  selectedDept.value = dept;
};

const handleCreate = () => {
  showCreateModal.value = false;
};

onMounted(() => {
  // Mock data
  departments.value = [
    {
      id: 1,
      code: 'IT',
      name: 'Phòng Công nghệ Thông tin',
      is_active: true,
      employees: [
        { id: 1, code: 'EMP001', full_name: 'Nguyễn Văn A', job_title: { name: 'Senior Developer' } },
        { id: 2, code: 'EMP002', full_name: 'Trần Văn B', job_title: { name: 'Junior Developer' } }
      ]
    },
    {
      id: 2,
      code: 'HR',
      name: 'Phòng Nhân sự',
      is_active: true,
      employees: [
        { id: 3, code: 'EMP003', full_name: 'Lê Thị C', job_title: { name: 'HR Manager' } }
      ]
    },
    {
      id: 3,
      code: 'SALES',
      name: 'Phòng Kinh doanh',
      is_active: true,
      employees: []
    }
  ] as any;
});
</script>