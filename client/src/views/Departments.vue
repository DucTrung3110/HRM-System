<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Phòng ban</h1>
        <p class="text-muted-foreground mt-1">Cấu trúc tổ chức và phân cấp phòng ban</p>
      </div>
      <BaseButton
        @click="openCreateModal"
        data-testid="button-create-department"
      >
        + Thêm phòng ban
      </BaseButton>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">Đang tải dữ liệu từ API...</p>
    </div>

    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Lỗi kết nối API:</p>
      <p class="text-destructive/80 text-sm mt-1">{{ error }}</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard title="Cấu trúc phòng ban" class="lg:col-span-1">
        <div v-if="departments.length === 0" class="text-center py-8 text-muted-foreground">
          Chưa có phòng ban nào
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="dept in departments"
            :key="dept.id"
            @click="selectDepartment(dept)"
            :class="['p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted',
                     selectedDept?.id === dept.id ? 'bg-primary/10 border-l-4 border-primary' : '']"
            :data-testid="`dept-item-${dept.id}`"
          >
            <div class="flex items-center gap-2">
              <IconBuilding class="w-5 h-5" />
              <div class="flex-1">
                <p class="font-medium text-sm">{{ dept.name }}</p>
                <p class="text-xs text-muted-foreground">{{ dept.code }}</p>
              </div>
              <BaseBadge size="sm" :variant="dept.is_active ? 'success' : 'default'">
                {{ dept.is_active ? 'Hoạt động' : 'Tạm dừng' }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Chi tiết phòng ban" class="lg:col-span-2">
        <div v-if="selectedDept" class="space-y-6">
          <div class="flex justify-between items-start">
            <div class="grid grid-cols-2 gap-4 flex-1">
              <div>
                <p class="text-sm text-muted-foreground">Mã phòng ban</p>
                <p class="font-medium">{{ selectedDept.code }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Tên phòng ban</p>
                <p class="font-medium">{{ selectedDept.name }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Trạng thái</p>
                <BaseBadge :variant="selectedDept.is_active ? 'success' : 'default'">
                  {{ selectedDept.is_active ? 'Hoạt động' : 'Tạm dừng' }}
                </BaseBadge>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Phòng ban cha</p>
                <p class="font-medium">{{ getParentName(selectedDept.parent_id) }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <BaseButton variant="outline" size="sm" @click="openEditModal(selectedDept)">
                Sửa
              </BaseButton>
              <BaseButton variant="destructive" size="sm" @click="confirmDelete(selectedDept)">
                Xóa
              </BaseButton>
            </div>
          </div>

          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-3">Nhân viên trong phòng ban</h3>
            <div class="space-y-2">
              <div
                v-for="emp in selectedDept.employees || []"
                :key="emp.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
              >
                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {{ getInitials(emp.full_name) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ emp.full_name }}</p>
                  <p class="text-xs text-muted-foreground">{{ emp.job_title || '' }}</p>
                </div>
              </div>
              <div v-if="loadingEmployees" class="text-center py-4 text-muted-foreground">
                Đang tải...
              </div>
              <div v-else-if="!selectedDept.employees?.length" class="text-center py-8 text-muted-foreground">
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

    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'"
      data-testid="modal-department"
    >
      <div class="space-y-4">
        <BaseInput 
          v-model="form.code" 
          label="Mã phòng ban" 
          required 
          :disabled="isEditing"
          placeholder="VD: IT-001"
        />
        <BaseInput 
          v-model="form.name" 
          label="Tên phòng ban" 
          required 
          placeholder="VD: Phòng Công nghệ thông tin"
        />
        <BaseSelect 
          v-model="form.parent_id" 
          label="Phòng ban cha" 
          :options="parentOptions" 
          placeholder="Không có"
        />
        <BaseSelect 
          v-model="form.is_active" 
          label="Trạng thái" 
          :options="statusOptions" 
        />
      </div>

      <div v-if="formError" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p class="text-destructive text-sm">{{ formError }}</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="closeModal" :disabled="saving">Hủy</BaseButton>
        <BaseButton @click="handleSubmit" :disabled="saving">
          {{ saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo mới') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showDeleteModal"
      title="Xác nhận xóa"
      size="sm"
    >
      <p class="text-muted-foreground">
        Bạn có chắc chắn muốn xóa phòng ban <strong>{{ deleteTarget?.name }}</strong>?
      </p>
      <p class="text-sm text-destructive mt-2">Hành động này không thể hoàn tác.</p>

      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" :disabled="deleting">Hủy</BaseButton>
        <BaseButton variant="destructive" @click="handleDelete" :disabled="deleting">
          {{ deleting ? 'Đang xóa...' : 'Xóa' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseModal from '../components/BaseModal.vue';
import IconBuilding from '../components/IconBuilding.vue';
import { departmentService } from '../services/departmentService';
import { employeeService } from '../services/employeeService';

const loading = ref(true);
const error = ref('');
const saving = ref(false);
const deleting = ref(false);
const formError = ref('');

const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const deleteTarget = ref(null);

const departments = ref([]);
const allEmployees = ref([]);
const selectedDept = ref(null);
const loadingEmployees = ref(false);

const form = ref({
  code: '',
  name: '',
  parent_id: '',
  is_active: 'true'
});

const statusOptions = [
  { label: 'Hoạt động', value: 'true' },
  { label: 'Tạm dừng', value: 'false' }
];

const parentOptions = computed(() => {
  const options = [{ label: 'Không có', value: '' }];
  departments.value.forEach(d => {
    if (!isEditing.value || d.id !== editingId.value) {
      options.push({ label: d.name, value: String(d.id) });
    }
  });
  return options;
});

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const getParentName = (parentId) => {
  if (!parentId) return 'Không có';
  const parent = departments.value.find(d => d.id === parentId);
  return parent ? parent.name : 'Không có';
};

const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    parent_id: '',
    is_active: 'true'
  };
  formError.value = '';
};

const openCreateModal = () => {
  resetForm();
  isEditing.value = false;
  editingId.value = null;
  showModal.value = true;
};

const openEditModal = (dept) => {
  resetForm();
  isEditing.value = true;
  editingId.value = dept.id;
  
  form.value = {
    code: dept.code || '',
    name: dept.name || '',
    parent_id: dept.parent_id ? String(dept.parent_id) : '',
    is_active: dept.is_active ? 'true' : 'false'
  };
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const selectDepartment = async (dept) => {
  selectedDept.value = { ...dept, employees: [] };
  loadingEmployees.value = true;
  
  try {
    const targetDeptId = Number(dept.id);
    
    const deptEmployees = allEmployees.value.filter(emp => {
      const empDeptId = Number(emp.department_id || emp.employment?.department_id || 0);
      return empDeptId === targetDeptId && empDeptId !== 0;
    });
    
    selectedDept.value = { 
      ...dept, 
      employees: deptEmployees.map(emp => ({
        ...emp,
        job_title: emp.job_title || emp.employment?.job_title?.name || ''
      }))
    };
  } catch (err) {
    console.error('Error loading department employees:', err);
  } finally {
    loadingEmployees.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.value.code?.trim()) {
    formError.value = 'Vui lòng nhập mã phòng ban';
    return;
  }
  
  if (!form.value.name?.trim()) {
    formError.value = 'Vui lòng nhập tên phòng ban';
    return;
  }

  try {
    saving.value = true;
    formError.value = '';
    
    const payload = {
      code: form.value.code,
      name: form.value.name,
      parent_id: form.value.parent_id ? parseInt(form.value.parent_id) : null,
      is_active: form.value.is_active === 'true'
    };

    if (isEditing.value) {
      await departmentService.update(editingId.value, payload);
    } else {
      await departmentService.create(payload);
    }
    
    closeModal();
    await loadDepartments();
    
    if (isEditing.value && selectedDept.value?.id === editingId.value) {
      selectedDept.value = departments.value.find(d => d.id === editingId.value) || null;
    }
  } catch (err) {
    console.error('Error saving department:', err);
    formError.value = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra khi lưu';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (dept) => {
  deleteTarget.value = dept;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;
  
  try {
    deleting.value = true;
    await departmentService.delete(deleteTarget.value.id);
    showDeleteModal.value = false;
    
    if (selectedDept.value?.id === deleteTarget.value.id) {
      selectedDept.value = null;
    }
    
    deleteTarget.value = null;
    await loadDepartments();
  } catch (err) {
    console.error('Error deleting department:', err);
    alert(err.response?.data?.error || 'Có lỗi xảy ra khi xóa');
  } finally {
    deleting.value = false;
  }
};

const loadDepartments = async () => {
  try {
    const response = await departmentService.getAll();
    departments.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading departments:', err);
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [deptsRes, empsRes] = await Promise.all([
      departmentService.getAll(),
      employeeService.getAll()
    ]);
    
    departments.value = deptsRes?.data || deptsRes || [];
    allEmployees.value = empsRes?.data || empsRes || [];
  } catch (err) {
    console.error('Departments API Error:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể kết nối đến API';
  } finally {
    loading.value = false;
  }
});
</script>
