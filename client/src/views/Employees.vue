<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Quản lý Nhân viên</h1>
        <p class="text-muted-foreground mt-1">Danh sách và quản lý thông tin nhân viên</p>
      </div>
      <BaseButton
        @click="openCreateModal"
        data-testid="button-create-employee"
      >
        + Thêm nhân viên
      </BaseButton>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">Đang tải dữ liệu từ API...</p>
    </div>

    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Lỗi kết nối API:</p>
      <p class="text-destructive/80 text-sm mt-1">{{ error }}</p>
    </div>

    <template v-else>
      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseInput
            v-model="filters.search"
            placeholder="Tìm kiếm theo tên, mã NV..."
            data-testid="input-search-employee"
          />
          <BaseSelect
            v-model="filters.department"
            :options="departmentOptions"
            placeholder="Tất cả phòng ban"
            data-testid="select-department-filter"
          />
          <BaseSelect
            v-model="filters.status"
            :options="statusOptions"
            placeholder="Tất cả trạng thái"
            data-testid="select-status-filter"
          />
          <BaseButton
            variant="outline"
            @click="applyFilters"
            data-testid="button-apply-filters"
          >
            Áp dụng
          </BaseButton>
        </div>
      </BaseCard>

      <BaseCard>
        <div v-if="filteredEmployees.length === 0" class="text-center py-8 text-muted-foreground">
          Chưa có nhân viên nào
        </div>
        <BaseTable
          v-else
          :columns="columns"
          :data="filteredEmployees"
          data-testid="table-employees"
        >
          <template #cell-full_name="{ item }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {{ getInitials(item.full_name) }}
              </div>
              <div>
                <p class="font-medium">{{ item.full_name }}</p>
                <p class="text-xs text-muted-foreground">{{ item.employee_code }}</p>
              </div>
            </div>
          </template>

          <template #cell-department="{ item }">
            <span class="text-sm">{{ item.department_name || '-' }}</span>
          </template>

          <template #cell-job_title="{ item }">
            <span class="text-sm">{{ item.job_title_name || '-' }}</span>
          </template>

          <template #cell-status="{ item }">
            <BaseBadge
              :variant="getStatusVariant(item.is_active)"
              data-testid="badge-employee-status"
            >
              {{ item.is_active ? 'Đang làm việc' : 'Nghỉ việc' }}
            </BaseBadge>
          </template>

          <template #actions="{ item }">
            <div class="flex items-center gap-2">
              <button
                @click="viewEmployee(item)"
                class="p-1 rounded hover:bg-muted"
                title="Xem chi tiết"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                @click="openEditModal(item)"
                class="p-1 rounded hover:bg-muted"
                title="Chỉnh sửa"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(item)"
                class="p-1 rounded hover:bg-muted text-destructive"
                title="Xóa"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </template>
        </BaseTable>
      </BaseCard>
    </template>

    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'"
      size="lg"
      data-testid="modal-employee"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput 
          v-model="form.employee_code" 
          label="Mã nhân viên" 
          required 
          :disabled="isEditing"
        />
        <BaseInput 
          v-model="form.full_name" 
          label="Họ và tên" 
          required 
        />
        <BaseInput 
          v-model="form.email" 
          label="Email công ty" 
          type="email" 
        />
        <BaseInput 
          v-model="form.personal_email" 
          label="Email cá nhân" 
          type="email" 
        />
        <BaseInput 
          v-model="form.phone" 
          label="Số điện thoại" 
        />
        <BaseInput 
          v-model="form.date_of_birth" 
          label="Ngày sinh" 
          type="date" 
        />
        <BaseSelect 
          v-model="form.gender" 
          label="Giới tính" 
          :options="genderOptions" 
        />
        <BaseSelect 
          v-model="form.department_id" 
          label="Phòng ban" 
          :options="departmentOptions" 
        />
        <BaseSelect 
          v-model="form.job_title_id" 
          label="Chức danh" 
          :options="jobTitleOptions" 
        />
        <BaseInput 
          v-model="form.hire_date" 
          label="Ngày vào làm" 
          type="date" 
        />
        <div class="md:col-span-2">
          <BaseInput 
            v-model="form.address" 
            label="Địa chỉ" 
          />
        </div>
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
        Bạn có chắc chắn muốn xóa nhân viên <strong>{{ deleteTarget?.full_name }}</strong>?
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
import { useRouter } from 'vue-router';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { jobTitleService } from '../services/jobTitleService';

const router = useRouter();

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

const employees = ref([]);
const departmentOptions = ref([]);
const jobTitleOptions = ref([]);

const filters = ref({
  search: '',
  department: '',
  status: ''
});

const form = ref({
  employee_code: '',
  full_name: '',
  email: '',
  personal_email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  address: '',
  department_id: '',
  job_title_id: '',
  hire_date: ''
});

const columns = [
  { key: 'full_name', label: 'Nhân viên' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Phòng ban' },
  { key: 'job_title', label: 'Chức danh' },
  { key: 'status', label: 'Trạng thái' },
];

const statusOptions = [
  { label: 'Đang làm việc', value: 'active' },
  { label: 'Nghỉ việc', value: 'inactive' },
];

const genderOptions = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
];

const filteredEmployees = computed(() => {
  let result = [...employees.value];
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(emp => 
      emp.full_name?.toLowerCase().includes(search) ||
      emp.employee_code?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search)
    );
  }
  
  if (filters.value.department) {
    result = result.filter(emp => String(emp.department_id) === filters.value.department);
  }
  
  if (filters.value.status) {
    const isActive = filters.value.status === 'active';
    result = result.filter(emp => emp.is_active === isActive);
  }
  
  return result;
});

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusVariant = (isActive) => {
  return isActive ? 'success' : 'default';
};

const resetForm = () => {
  form.value = {
    employee_code: '',
    full_name: '',
    email: '',
    personal_email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    department_id: '',
    job_title_id: '',
    hire_date: ''
  };
  formError.value = '';
};

const openCreateModal = () => {
  resetForm();
  isEditing.value = false;
  editingId.value = null;
  showModal.value = true;
};

const openEditModal = (employee) => {
  resetForm();
  isEditing.value = true;
  editingId.value = employee.id;
  
  form.value = {
    employee_code: employee.employee_code || '',
    full_name: employee.full_name || '',
    email: employee.email || '',
    personal_email: employee.personal_email || '',
    phone: employee.phone || '',
    date_of_birth: employee.date_of_birth || '',
    gender: employee.gender || '',
    address: employee.address || '',
    department_id: employee.department_id ? String(employee.department_id) : '',
    job_title_id: employee.job_title_id ? String(employee.job_title_id) : '',
    hire_date: employee.hire_date || ''
  };
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (!form.value.full_name?.trim()) {
    formError.value = 'Vui lòng nhập họ và tên';
    return;
  }
  
  if (!isEditing.value && !form.value.employee_code?.trim()) {
    formError.value = 'Vui lòng nhập mã nhân viên';
    return;
  }

  try {
    saving.value = true;
    formError.value = '';
    
    const payload = {
      code: form.value.employee_code,
      full_name: form.value.full_name,
      gender: form.value.gender || null,
      dob: form.value.date_of_birth || null,
      personal_email: form.value.personal_email || form.value.email || null,
      personal_phone: form.value.phone || null,
      address: form.value.address || null,
      department_id: form.value.department_id ? parseInt(form.value.department_id) : null,
      job_title_id: form.value.job_title_id ? parseInt(form.value.job_title_id) : null,
      start_date: form.value.hire_date || null,
      employment_status: 'active',
      employment_type: 'fulltime'
    };

    if (isEditing.value) {
      await employeeService.update(editingId.value, payload);
    } else {
      await employeeService.create(payload);
    }
    
    closeModal();
    await loadEmployees();
  } catch (err) {
    console.error('Error saving employee:', err);
    formError.value = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra khi lưu';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (employee) => {
  deleteTarget.value = employee;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;
  
  try {
    deleting.value = true;
    await employeeService.delete(deleteTarget.value.id);
    showDeleteModal.value = false;
    deleteTarget.value = null;
    await loadEmployees();
  } catch (err) {
    console.error('Error deleting employee:', err);
    alert(err.response?.data?.error || 'Có lỗi xảy ra khi xóa');
  } finally {
    deleting.value = false;
  }
};

const viewEmployee = (employee) => {
  router.push(`/employees/${employee.id}`);
};

const applyFilters = () => {
  // Filters are applied reactively via computed property
};

const loadEmployees = async () => {
  try {
    const response = await employeeService.getAll();
    employees.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading employees:', err);
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [employeesRes, departmentsRes, jobTitlesRes] = await Promise.all([
      employeeService.getAll(),
      departmentService.getAll(),
      jobTitleService.getAll()
    ]);
    
    employees.value = employeesRes?.data || employeesRes || [];
    
    const depts = departmentsRes?.data || departmentsRes || [];
    departmentOptions.value = depts.map(d => ({
      label: d.name,
      value: String(d.id)
    }));
    
    const titles = jobTitlesRes?.data || jobTitlesRes || [];
    jobTitleOptions.value = titles.map(t => ({
      label: t.name,
      value: String(t.id)
    }));
    
  } catch (err) {
    console.error('Employees API Error:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể kết nối đến API';
  } finally {
    loading.value = false;
  }
});
</script>
