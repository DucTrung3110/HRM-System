<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">Quản lý Nghỉ phép</h1>
        <p class="text-muted-foreground mt-1">Quản lý đơn xin nghỉ phép của nhân viên</p>
      </div>
      <BaseButton
        @click="openCreateModal"
        data-testid="button-create-leave"
        class="w-full sm:w-auto"
      >
        + Tạo đơn xin nghỉ
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Chờ duyệt</p>
            <p class="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{{ statusCounts.pending }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Đã duyệt</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{{ statusCounts.approved }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Từ chối</p>
            <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{{ statusCounts.rejected }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Tổng đơn</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{{ requests.length }}</p>
          </div>
        </BaseCard>
      </div>

      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseSelect
            v-model="filters.status"
            label="Trạng thái"
            :options="statusOptions"
            data-testid="select-status"
          />
          <BaseSelect
            v-model="filters.leaveType"
            label="Loại nghỉ"
            :options="leaveTypeOptions"
            data-testid="select-leave-type"
          />
          <BaseInput
            v-model="filters.startDate"
            type="date"
            label="Từ ngày"
            data-testid="input-start-date"
          />
          <div class="flex items-end">
            <BaseButton
              variant="outline"
              @click="applyFilters"
              data-testid="button-apply-filters"
            >
              Áp dụng
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Danh sách yêu cầu">
        <div v-if="filteredRequests.length === 0" class="text-center py-8 text-muted-foreground">
          Chưa có yêu cầu nghỉ phép nào
        </div>
        <BaseTable
          v-else
          :columns="columns"
          :data="filteredRequests"
          data-testid="table-leaves"
        >
          <template #cell-employee="{ item }">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {{ getInitials(item.full_name || '') }}
              </div>
              <span class="font-medium">{{ item.full_name || `NV #${item.employee_id}` }}</span>
            </div>
          </template>

          <template #cell-leave_type="{ item }">
            <span class="text-sm">{{ item.leave_type || getLeaveTypeName(item.leave_type_id) }}</span>
          </template>

          <template #cell-dates="{ item }">
            <div class="text-sm">
              <p>{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</p>
              <p class="text-xs text-muted-foreground">{{ item.total_days || item.days_count || 0 }} ngày</p>
            </div>
          </template>

          <template #cell-reason="{ item }">
            <span class="text-sm text-muted-foreground">{{ item.reason || '-' }}</span>
          </template>

          <template #cell-status="{ value }">
            <BaseBadge :variant="getStatusVariant(value)">
              {{ getStatusText(value) }}
            </BaseBadge>
          </template>

          <template #actions="{ item }">
            <div class="flex items-center gap-2">
              <template v-if="item.status === 'pending'">
                <button
                  @click="approveRequest(item)"
                  class="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                  title="Duyệt"
                  :disabled="processing"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  @click="rejectRequest(item)"
                  class="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                  title="Từ chối"
                  :disabled="processing"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </template>
              <button
                @click="viewDetail(item)"
                class="p-1.5 rounded hover:bg-muted"
                title="Xem chi tiết"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </template>
        </BaseTable>
      </BaseCard>
    </template>

    <BaseModal
      v-model="showCreateModal"
      title="Tạo đơn xin nghỉ"
      data-testid="modal-create-leave"
    >
      <div class="space-y-4">
        <BaseSelect
          v-model="form.employee_id"
          label="Nhân viên"
          :options="employeeOptions"
          required
        />
        <BaseSelect
          v-model="form.leave_type_id"
          label="Loại nghỉ"
          :options="leaveTypeOptions.filter(o => o.value)"
          required
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model="form.start_date"
            type="date"
            label="Từ ngày"
            required
          />
          <BaseInput
            v-model="form.end_date"
            type="date"
            label="Đến ngày"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Lý do</label>
          <textarea
            v-model="form.reason"
            class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows="4"
            placeholder="Nhập lý do xin nghỉ..."
          ></textarea>
        </div>
      </div>

      <div v-if="formError" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p class="text-destructive text-sm">{{ formError }}</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="closeCreateModal" :disabled="saving">Hủy</BaseButton>
        <BaseButton @click="handleCreate" :disabled="saving">
          {{ saving ? 'Đang tạo...' : 'Tạo đơn' }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showDetailModal"
      title="Chi tiết đơn nghỉ phép"
    >
      <div v-if="selectedRequest" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Nhân viên</p>
            <p class="font-medium">{{ selectedRequest.full_name || `NV #${selectedRequest.employee_id}` }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Loại nghỉ</p>
            <p class="font-medium">{{ selectedRequest.leave_type || getLeaveTypeName(selectedRequest.leave_type_id) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Từ ngày</p>
            <p class="font-medium">{{ formatDate(selectedRequest.start_date) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Đến ngày</p>
            <p class="font-medium">{{ formatDate(selectedRequest.end_date) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Số ngày</p>
            <p class="font-medium">{{ selectedRequest.total_days || selectedRequest.days_count || 0 }} ngày</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Trạng thái</p>
            <BaseBadge :variant="getStatusVariant(selectedRequest.status)">
              {{ getStatusText(selectedRequest.status) }}
            </BaseBadge>
          </div>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Lý do</p>
          <p class="font-medium">{{ selectedRequest.reason || 'Không có' }}</p>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showDetailModal = false">Đóng</BaseButton>
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
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import { leaveService } from '../services/leaveService';
import { employeeService } from '../services/employeeService';

const loading = ref(true);
const error = ref('');
const saving = ref(false);
const processing = ref(false);
const formError = ref('');

const showCreateModal = ref(false);
const showDetailModal = ref(false);
const selectedRequest = ref(null);

const requests = ref([]);
const leaveTypes = ref([]);
const employees = ref([]);

const filters = ref({
  status: '',
  leaveType: '',
  startDate: ''
});

const form = ref({
  employee_id: '',
  leave_type_id: '',
  start_date: '',
  end_date: '',
  reason: ''
});

const columns = [
  { key: 'employee', label: 'Nhân viên' },
  { key: 'leave_type', label: 'Loại nghỉ' },
  { key: 'dates', label: 'Thời gian' },
  { key: 'reason', label: 'Lý do' },
  { key: 'status', label: 'Trạng thái' },
];

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
];

const leaveTypeOptions = computed(() => {
  const options = [{ label: 'Tất cả', value: '' }];
  leaveTypes.value.forEach(t => {
    options.push({ label: t.name, value: String(t.id) });
  });
  return options;
});

const employeeOptions = computed(() => {
  return employees.value.map(e => ({
    label: e.full_name,
    value: String(e.id)
  }));
});

const statusCounts = computed(() => {
  return {
    pending: requests.value.filter(r => r.status === 'pending').length,
    approved: requests.value.filter(r => r.status === 'approved').length,
    rejected: requests.value.filter(r => r.status === 'rejected').length
  };
});

const filteredRequests = computed(() => {
  let result = [...requests.value];
  
  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status);
  }
  
  if (filters.value.leaveType) {
    result = result.filter(r => String(r.leave_type_id) === filters.value.leaveType);
  }
  
  if (filters.value.startDate) {
    result = result.filter(r => r.start_date >= filters.value.startDate);
  }
  
  return result;
});

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

const getStatusVariant = (status) => {
  const variants = {
    draft: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    cancelled: 'default'
  };
  return variants[status] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    draft: 'Nháp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy'
  };
  return texts[status] || status;
};

const getLeaveTypeName = (id) => {
  const type = leaveTypes.value.find(t => t.id === id);
  return type ? type.name : `Loại #${id}`;
};

const resetForm = () => {
  form.value = {
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  };
  formError.value = '';
};

const openCreateModal = () => {
  resetForm();
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const viewDetail = (request) => {
  selectedRequest.value = request;
  showDetailModal.value = true;
};

const handleCreate = async () => {
  if (!form.value.employee_id) {
    formError.value = 'Vui lòng chọn nhân viên';
    return;
  }
  if (!form.value.leave_type_id) {
    formError.value = 'Vui lòng chọn loại nghỉ';
    return;
  }
  if (!form.value.start_date || !form.value.end_date) {
    formError.value = 'Vui lòng chọn ngày bắt đầu và kết thúc';
    return;
  }

  try {
    saving.value = true;
    formError.value = '';
    
    const startDate = new Date(form.value.start_date);
    const endDate = new Date(form.value.end_date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    await leaveService.createRequest({
      employee_id: parseInt(form.value.employee_id),
      leave_type_id: parseInt(form.value.leave_type_id),
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      total_days: diffDays,
      days_count: diffDays,
      reason: form.value.reason,
      status: 'pending'
    });
    
    closeCreateModal();
    await loadRequests();
  } catch (err) {
    console.error('Error creating leave request:', err);
    formError.value = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra';
  } finally {
    saving.value = false;
  }
};

const approveRequest = async (request) => {
  if (processing.value) return;
  
  try {
    processing.value = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await leaveService.approveRequest(request.id, user.id);
    await loadRequests();
  } catch (err) {
    console.error('Error approving request:', err);
    alert(err.response?.data?.error || 'Có lỗi xảy ra khi duyệt');
  } finally {
    processing.value = false;
  }
};

const rejectRequest = async (request) => {
  if (processing.value) return;
  
  try {
    processing.value = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await leaveService.rejectRequest(request.id, user.id);
    await loadRequests();
  } catch (err) {
    console.error('Error rejecting request:', err);
    alert(err.response?.data?.error || 'Có lỗi xảy ra khi từ chối');
  } finally {
    processing.value = false;
  }
};

const applyFilters = () => {
  // Filters are applied reactively
};

const loadRequests = async () => {
  try {
    const response = await leaveService.getRequests();
    requests.value = response?.data || response || [];
  } catch (err) {
    console.error('Error loading requests:', err);
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [requestsRes, typesRes, employeesRes] = await Promise.all([
      leaveService.getRequests(),
      leaveService.getTypes().catch(() => []),
      employeeService.getAll().catch(() => [])
    ]);
    
    requests.value = requestsRes?.data || requestsRes || [];
    leaveTypes.value = typesRes?.data || typesRes || [];
    employees.value = employeesRes?.data || employeesRes || [];
    
  } catch (err) {
    console.error('Leaves API Error:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể kết nối đến API';
  } finally {
    loading.value = false;
  }
});
</script>
