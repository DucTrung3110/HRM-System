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
            :options="statusFilterOptions"
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

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <BaseCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <IconUser class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalEmployees }}</p>
              <p class="text-sm text-muted-foreground">Tổng nhân viên</p>
            </div>
          </div>
        </BaseCard>
        <BaseCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <IconUser class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ activeEmployees }}</p>
              <p class="text-sm text-muted-foreground">Đang làm việc</p>
            </div>
          </div>
        </BaseCard>
        <BaseCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <IconUser class="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-yellow-600">{{ probationEmployees }}</p>
              <p class="text-sm text-muted-foreground">Thử việc</p>
            </div>
          </div>
        </BaseCard>
        <BaseCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <IconUser class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-600">{{ inactiveEmployees }}</p>
              <p class="text-sm text-muted-foreground">Nghỉ việc</p>
            </div>
          </div>
        </BaseCard>
      </div>

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

          <template #cell-email="{ item }">
            <span class="text-sm">{{ item.personal_email || item.email || '-' }}</span>
          </template>

          <template #cell-department="{ item }">
            <span class="text-sm">{{ item.department || item.department_name || '-' }}</span>
          </template>

          <template #cell-job_title="{ item }">
            <span class="text-sm">{{ item.job_title || item.job_title_name || '-' }}</span>
          </template>

          <template #cell-status="{ item }">
            <BaseBadge
              :variant="getStatusVariant(item.employment_status)"
              data-testid="badge-employee-status"
            >
              {{ getStatusLabel(item.employment_status) }}
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
                @click="openStatusModal(item)"
                class="p-1 rounded hover:bg-muted"
                :class="item.employment_status === 'active' ? 'text-yellow-600' : 'text-green-600'"
                :title="item.employment_status === 'active' ? 'Đổi sang nghỉ việc' : 'Đổi sang đang làm việc'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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
          v-model="form.work_email" 
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
        <BaseSelect 
          v-model="form.employment_status" 
          label="Trạng thái làm việc" 
          :options="employmentStatusOptions" 
        />
        <BaseSelect 
          v-model="form.employment_type" 
          label="Loại hình làm việc" 
          :options="employmentTypeOptions" 
        />
        <div class="md:col-span-2">
          <BaseInput 
            v-model="form.address" 
            label="Địa chỉ" 
          />
        </div>
        <BaseInput 
          v-model="form.bank_name" 
          label="Ngân hàng" 
        />
        <BaseInput 
          v-model="form.bank_account" 
          label="Số tài khoản" 
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
      v-model="showStatusModal"
      title="Thay đổi trạng thái làm việc"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-muted-foreground">
          Nhân viên: <strong>{{ statusTarget?.full_name }}</strong>
        </p>
        <p class="text-muted-foreground">
          Trạng thái hiện tại: 
          <BaseBadge :variant="getStatusVariant(statusTarget?.employment_status)">
            {{ getStatusLabel(statusTarget?.employment_status) }}
          </BaseBadge>
        </p>
        <BaseSelect 
          v-model="newStatus" 
          label="Trạng thái mới" 
          :options="employmentStatusOptions" 
        />
        <BaseInput 
          v-if="newStatus === 'inactive' || newStatus === 'resigned' || newStatus === 'terminated'"
          v-model="terminationDate" 
          label="Ngày nghỉ việc" 
          type="date" 
        />
        <BaseInput 
          v-if="newStatus === 'inactive' || newStatus === 'resigned' || newStatus === 'terminated'"
          v-model="terminationReason" 
          label="Lý do nghỉ việc" 
        />
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showStatusModal = false" :disabled="updatingStatus">Hủy</BaseButton>
        <BaseButton @click="handleStatusChange" :disabled="updatingStatus">
          {{ updatingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái' }}
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
import IconUser from '../components/IconUser.vue';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { jobTitleService } from '../services/jobTitleService';

const router = useRouter();

const loading = ref(true);
const error = ref('');
const saving = ref(false);
const updatingStatus = ref(false);
const formError = ref('');

const showModal = ref(false);
const showStatusModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const statusTarget = ref(null);
const newStatus = ref('');
const terminationDate = ref('');
const terminationReason = ref('');

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
  work_email: '',
  personal_email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  address: '',
  department_id: '',
  job_title_id: '',
  hire_date: '',
  employment_status: 'active',
  employment_type: 'fulltime',
  bank_name: '',
  bank_account: ''
});

const columns = [
  { key: 'full_name', label: 'Nhân viên' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Phòng ban' },
  { key: 'job_title', label: 'Chức danh' },
  { key: 'status', label: 'Trạng thái' },
];

const statusFilterOptions = [
  { label: 'Đang làm việc', value: 'active' },
  { label: 'Thử việc', value: 'probation' },
  { label: 'Nghỉ việc', value: 'inactive' },
  { label: 'Đã nghỉ', value: 'resigned' },
];

const employmentStatusOptions = [
  { label: 'Đang làm việc', value: 'active' },
  { label: 'Thử việc', value: 'probation' },
  { label: 'Nghỉ việc', value: 'inactive' },
  { label: 'Đã nghỉ', value: 'resigned' },
  { label: 'Chấm dứt HĐ', value: 'terminated' },
];

const employmentTypeOptions = [
  { label: 'Toàn thời gian', value: 'fulltime' },
  { label: 'Bán thời gian', value: 'parttime' },
  { label: 'Hợp đồng', value: 'contract' },
  { label: 'Thực tập', value: 'intern' },
];

const genderOptions = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
];

const totalEmployees = computed(() => employees.value.length);
const activeEmployees = computed(() => 
  employees.value.filter(e => e.employment_status === 'active' || e.is_active === true).length
);
const probationEmployees = computed(() => 
  employees.value.filter(e => e.employment_status === 'probation').length
);
const inactiveEmployees = computed(() => 
  employees.value.filter(e => 
    e.employment_status === 'inactive' || 
    e.employment_status === 'resigned' || 
    e.employment_status === 'terminated' ||
    e.is_active === false
  ).length
);

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
    result = result.filter(emp => emp.employment_status === filters.value.status);
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

const getStatusVariant = (status) => {
  if (status === 'active' || status === true) return 'success';
  if (status === 'probation') return 'warning';
  if (status === 'inactive' || status === 'resigned' || status === 'terminated') return 'default';
  return 'default';
};

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Đang làm việc',
    'probation': 'Thử việc',
    'inactive': 'Nghỉ việc',
    'terminated': 'Chấm dứt HĐ',
    'resigned': 'Đã nghỉ'
  };
  return labels[status] || (status ? 'Đang làm việc' : 'Nghỉ việc');
};

const resetForm = () => {
  form.value = {
    employee_code: '',
    full_name: '',
    work_email: '',
    personal_email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    department_id: '',
    job_title_id: '',
    hire_date: '',
    employment_status: 'active',
    employment_type: 'fulltime',
    bank_name: '',
    bank_account: ''
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
  
  // Try to find department_id by matching name if ID not provided
  let deptId = employee.department_id ? String(employee.department_id) : '';
  if (!deptId && (employee.department || employee.department_name)) {
    const deptName = employee.department || employee.department_name;
    const matchedDept = departmentOptions.value.find(d => d.label === deptName);
    if (matchedDept) deptId = matchedDept.value;
  }
  
  // Try to find job_title_id by matching name if ID not provided
  let jobId = employee.job_title_id ? String(employee.job_title_id) : '';
  if (!jobId && (employee.job_title || employee.job_title_name)) {
    const jobName = employee.job_title || employee.job_title_name;
    const matchedJob = jobTitleOptions.value.find(j => j.label === jobName);
    if (matchedJob) jobId = matchedJob.value;
  }
  
  form.value = {
    employee_code: employee.employee_code || employee.code || '',
    full_name: employee.full_name || '',
    work_email: employee.work_email || employee.email || '',
    personal_email: employee.personal_email || '',
    phone: employee.phone || employee.personal_phone || '',
    date_of_birth: employee.date_of_birth || employee.dob || '',
    gender: employee.gender || '',
    address: employee.address || '',
    department_id: deptId,
    job_title_id: jobId,
    hire_date: employee.hire_date || employee.start_date || '',
    employment_status: employee.employment_status || 'active',
    employment_type: employee.employment_type || 'fulltime',
    bank_name: employee.bank_name || '',
    bank_account: employee.bank_account || ''
  };
  
  showModal.value = true;
};

const openStatusModal = (employee) => {
  statusTarget.value = employee;
  newStatus.value = employee.employment_status || 'active';
  terminationDate.value = '';
  terminationReason.value = '';
  showStatusModal.value = true;
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
      work_email: form.value.work_email || null,
      personal_email: form.value.personal_email || null,
      personal_phone: form.value.phone || null,
      address: form.value.address || null,
      department_id: form.value.department_id ? parseInt(form.value.department_id) : null,
      job_title_id: form.value.job_title_id ? parseInt(form.value.job_title_id) : null,
      start_date: form.value.hire_date || null,
      employment_status: form.value.employment_status,
      employment_type: form.value.employment_type,
      bank_name: form.value.bank_name || null,
      bank_account: form.value.bank_account || null
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

const handleStatusChange = async () => {
  if (!statusTarget.value || !newStatus.value) return;
  
  try {
    updatingStatus.value = true;
    
    // Find current department_id and job_title_id by name matching
    let deptId = statusTarget.value.department_id;
    if (!deptId && (statusTarget.value.department || statusTarget.value.department_name)) {
      const deptName = statusTarget.value.department || statusTarget.value.department_name;
      const matchedDept = departmentOptions.value.find(d => d.label === deptName);
      if (matchedDept) deptId = parseInt(matchedDept.value);
    }
    
    let jobId = statusTarget.value.job_title_id;
    if (!jobId && (statusTarget.value.job_title || statusTarget.value.job_title_name)) {
      const jobName = statusTarget.value.job_title || statusTarget.value.job_title_name;
      const matchedJob = jobTitleOptions.value.find(j => j.label === jobName);
      if (matchedJob) jobId = parseInt(matchedJob.value);
    }
    
    // Always use today's date for new employment history so it becomes the latest record
    const payload = {
      employment_status: newStatus.value,
      department_id: deptId || null,
      job_title_id: jobId || null,
      start_date: new Date().toISOString().split('T')[0]
    };
    
    if (terminationDate.value) {
      payload.end_date = terminationDate.value;
    }
    
    await employeeService.update(statusTarget.value.id, payload);
    const index = employees.value.findIndex(e => e.id === statusTarget.value.id);
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], employment_status: newStatus.value };
    }
    showStatusModal.value = false;
    statusTarget.value = null;
    await loadEmployees();
  } catch (err) {
    console.error('Error updating status:', err);
    alert(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
  } finally {
    updatingStatus.value = false;
  }
};

const viewEmployee = (employee) => {
  router.push(`/employees/${employee.id}`);
};

const applyFilters = () => {
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
