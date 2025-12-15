<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">{{ isAdmin ? 'Quản lý Chấm công' : 'Chấm công của tôi' }}</h1>
        <p class="text-muted-foreground mt-1">{{ isAdmin ? 'Theo dõi và báo cáo chấm công nhân viên' : 'Xem và quản lý chấm công cá nhân' }}</p>
      </div>
      <BaseButton v-if="isAdmin" @click="openCheckInModal">
        + Chấm công
      </BaseButton>
    </div>
    
    <template v-if="isAdmin">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Có mặt</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{{ todaySummary.present }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Vắng mặt</p>
            <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{{ todaySummary.absent }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Đi muộn</p>
            <p class="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{{ todaySummary.late }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">Nửa ngày</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{{ todaySummary.halfDay }}</p>
          </div>
        </BaseCard>
      </div>
    </template>
    
    <BaseCard class="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">Đồng hồ chấm công</h2>
            <p class="text-2xl font-mono text-primary">{{ currentTime }}</p>
            <p class="text-sm text-muted-foreground">{{ currentDate }}</p>
          </div>
        </div>
        
        <div class="flex flex-col items-center gap-3">
          <template v-if="isAdmin">
            <BaseSelect
              v-if="employees.length > 0"
              v-model="clockEmployeeId"
              :options="employeeOptions.filter(o => o.value)"
              class="w-64"
              placeholder="Chọn nhân viên"
            />
          </template>
          
          <div v-if="clockEmployeeId">
            <div v-if="clockLoading" class="text-muted-foreground">
              Đang kiểm tra...
            </div>
            <div v-else-if="todayRecord === null">
              <BaseButton 
                @click="handleQuickCheckIn" 
                :disabled="clockProcessing"
                class="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                <svg class="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {{ clockProcessing ? 'Đang xử lý...' : 'CHECK IN' }}
              </BaseButton>
            </div>
            <div v-else-if="todayRecord && !todayRecord.check_out_time">
              <div class="text-center mb-2">
                <span class="text-sm text-muted-foreground">Đã vào lúc: </span>
                <span class="font-mono font-bold text-green-600">{{ formatTime(todayRecord.check_in_time) }}</span>
              </div>
              <BaseButton 
                @click="handleQuickCheckOut" 
                :disabled="clockProcessing"
                class="px-8 py-4 text-lg bg-red-600 hover:bg-red-700 text-white"
              >
                <svg class="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ clockProcessing ? 'Đang xử lý...' : 'CHECK OUT' }}
              </BaseButton>
            </div>
            <div v-else>
              <div class="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="font-bold text-green-600">Hoàn thành hôm nay!</p>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ formatTime(todayRecord.check_in_time) }} - {{ formatTime(todayRecord.check_out_time) }}
                </p>
              </div>
            </div>
          </div>
          <p v-else-if="isAdmin" class="text-sm text-muted-foreground">Chọn nhân viên để chấm công</p>
          <p v-else class="text-sm text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    </BaseCard>
    
    <template v-if="isAdmin">
      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <BaseInput
            v-model="filters.startDate"
            type="date"
            label="Từ ngày"
          />
          <BaseInput
            v-model="filters.endDate"
            type="date"
            label="Đến ngày"
          />
          <BaseSelect
            v-model="filters.employee_id"
            label="Nhân viên"
            :options="employeeOptions"
            placeholder="Tất cả"
          />
          <BaseSelect
            v-model="filters.status"
            label="Trạng thái"
            :options="statusOptions"
          />
          <div class="flex items-end">
            <BaseButton
              variant="outline"
              @click="applyFilters"
            >
              Áp dụng
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </template>
    
    <BaseCard :title="isAdmin ? 'Bảng chấm công' : 'Lịch sử chấm công của tôi'">
      <div v-if="loading" class="text-center py-8">
        <p class="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
      <div v-else-if="displayRecords.length === 0" class="text-center py-8 text-muted-foreground">
        Chưa có dữ liệu chấm công
      </div>
      <BaseTable
        v-else
        :columns="displayColumns"
        :data="displayRecords"
      >
        <template v-if="isAdmin" #cell-employee="{ item }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {{ getInitials(item.full_name) }}
            </div>
            <div>
              <span class="font-medium">{{ item.full_name || `NV #${item.employee_id}` }}</span>
              <p class="text-xs text-muted-foreground">{{ item.employee_code || '' }}</p>
            </div>
          </div>
        </template>
        
        <template #cell-record_date="{ value }">
          <span class="text-sm">{{ formatDate(value) }}</span>
        </template>
        
        <template #cell-check_in_time="{ value }">
          <span class="text-sm font-medium">{{ formatTime(value) }}</span>
        </template>
        
        <template #cell-check_out_time="{ value }">
          <span class="text-sm font-medium">{{ formatTime(value) }}</span>
        </template>
        
        <template #cell-total_work_hours="{ value }">
          <span class="text-sm font-medium">{{ value || 0 }}h</span>
        </template>
        
        <template #cell-status="{ value }">
          <BaseBadge :variant="getStatusVariant(value)">
            {{ getStatusText(value) }}
          </BaseBadge>
        </template>

        <template v-if="isAdmin" #actions="{ item }">
          <div class="flex items-center gap-2">
            <button
              v-if="!item.check_out_time && item.check_in_time"
              @click="handleCheckOut(item)"
              class="p-1.5 rounded hover:bg-muted text-primary"
              title="Check-out"
              :disabled="processing"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button
              @click="openEditModal(item)"
              class="p-1.5 rounded hover:bg-muted"
              title="Chỉnh sửa"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model="showCheckInModal"
      title="Chấm công"
    >
      <div class="space-y-4">
        <BaseSelect
          v-model="checkInForm.employee_id"
          label="Nhân viên"
          :options="employeeOptions.filter(o => o.value)"
          required
        />
        <BaseSelect
          v-model="checkInForm.status"
          label="Trạng thái"
          :options="checkInStatusOptions"
        />
        <BaseInput
          v-model="checkInForm.notes"
          label="Ghi chú"
          placeholder="Ghi chú (nếu có)"
        />
      </div>

      <div v-if="formError" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p class="text-destructive text-sm">{{ formError }}</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showCheckInModal = false" :disabled="saving">Hủy</BaseButton>
        <BaseButton @click="handleCheckIn" :disabled="saving">
          {{ saving ? 'Đang lưu...' : 'Check-in' }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showEditModal"
      title="Chỉnh sửa chấm công"
    >
      <div v-if="editingRecord" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Nhân viên</p>
            <p class="font-medium">{{ editingRecord.full_name || `NV #${editingRecord.employee_id}` }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Ngày</p>
            <p class="font-medium">{{ formatDate(editingRecord.record_date) }}</p>
          </div>
        </div>
        <BaseSelect
          v-model="editForm.status"
          label="Trạng thái"
          :options="checkInStatusOptions"
        />
        <BaseInput
          v-model="editForm.late_minutes"
          label="Phút đi muộn"
          type="number"
        />
        <BaseInput
          v-model="editForm.overtime_hours"
          label="Giờ tăng ca"
          type="number"
          step="0.5"
        />
        <BaseInput
          v-model="editForm.notes"
          label="Ghi chú"
        />
      </div>

      <div v-if="formError" class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p class="text-destructive text-sm">{{ formError }}</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showEditModal = false" :disabled="saving">Hủy</BaseButton>
        <BaseButton @click="handleUpdate" :disabled="saving">
          {{ saving ? 'Đang lưu...' : 'Cập nhật' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import { authService } from '../services/authService';
import { useToast } from '../composables/useToast';

const toast = useToast();

const isAdmin = computed(() => authService.isAdmin());
const currentUser = computed(() => authService.getUser());

const loading = ref(true);
const saving = ref(false);
const processing = ref(false);
const formError = ref('');

const showCheckInModal = ref(false);
const showEditModal = ref(false);
const editingRecord = ref(null);

const records = ref([]);
const employees = ref([]);

const clockEmployeeId = ref('');
const clockLoading = ref(false);
const clockProcessing = ref(false);
const todayRecord = ref(null);
const currentTime = ref('');
const currentDate = ref('');
let clockInterval = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const checkTodayStatus = async (employeeId) => {
  if (!employeeId) {
    todayRecord.value = null;
    return;
  }
  
  try {
    clockLoading.value = true;
    const today = new Date().toISOString().split('T')[0];
    const response = await attendanceService.getRecords({
      employee_id: employeeId,
      from: today,
      to: today
    });
    const todayRecords = response || [];
    todayRecord.value = todayRecords.length > 0 ? todayRecords[0] : null;
  } catch (err) {
    console.error('Error checking today status:', err);
    todayRecord.value = null;
  } finally {
    clockLoading.value = false;
  }
};

watch(clockEmployeeId, (newId) => {
  checkTodayStatus(newId);
});

const handleQuickCheckIn = async () => {
  if (!clockEmployeeId.value || clockProcessing.value) return;
  
  try {
    clockProcessing.value = true;
    await attendanceService.checkIn(parseInt(clockEmployeeId.value), 'present');
    toast.success('Check-in thành công!');
    await checkTodayStatus(clockEmployeeId.value);
    await loadData();
  } catch (err) {
    console.error('Error checking in:', err);
    toast.error(err.response?.data?.error || 'Có lỗi xảy ra khi check-in');
  } finally {
    clockProcessing.value = false;
  }
};

const handleQuickCheckOut = async () => {
  if (!todayRecord.value || clockProcessing.value) return;
  
  try {
    clockProcessing.value = true;
    await attendanceService.checkOut(todayRecord.value.id, todayRecord.value.status || 'present');
    toast.success('Check-out thành công!');
    await checkTodayStatus(clockEmployeeId.value);
    await loadData();
  } catch (err) {
    console.error('Error checking out:', err);
    toast.error(err.response?.data?.error || 'Có lỗi xảy ra khi check-out');
  } finally {
    clockProcessing.value = false;
  }
};

const todaySummary = ref({
  present: 0,
  absent: 0,
  late: 0,
  halfDay: 0
});

const filters = ref({
  startDate: '',
  endDate: '',
  employee_id: '',
  status: ''
});

const checkInForm = ref({
  employee_id: '',
  status: 'present',
  notes: ''
});

const editForm = ref({
  status: '',
  late_minutes: 0,
  overtime_hours: 0,
  notes: ''
});

const adminColumns = [
  { key: 'employee', label: 'Nhân viên' },
  { key: 'record_date', label: 'Ngày' },
  { key: 'check_in_time', label: 'Giờ vào' },
  { key: 'check_out_time', label: 'Giờ ra' },
  { key: 'total_work_hours', label: 'Tổng giờ' },
  { key: 'status', label: 'Trạng thái' },
];

const employeeColumns = [
  { key: 'record_date', label: 'Ngày' },
  { key: 'check_in_time', label: 'Giờ vào' },
  { key: 'check_out_time', label: 'Giờ ra' },
  { key: 'total_work_hours', label: 'Tổng giờ' },
  { key: 'status', label: 'Trạng thái' },
];

const displayColumns = computed(() => isAdmin.value ? adminColumns : employeeColumns);

const displayRecords = computed(() => {
  if (isAdmin.value) {
    return records.value;
  }
  const user = currentUser.value;
  if (!user?.employee_id) return records.value;
  return records.value.filter(r => String(r.employee_id) === String(user.employee_id));
});

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Có mặt', value: 'present' },
  { label: 'Vắng', value: 'absent' },
  { label: 'Đi muộn', value: 'late' },
  { label: 'Nửa ngày', value: 'half_day' },
];

const checkInStatusOptions = [
  { label: 'Có mặt', value: 'present' },
  { label: 'Đi muộn', value: 'late' },
  { label: 'Nửa ngày', value: 'half_day' },
];

const employeeOptions = computed(() => {
  const options = [{ label: 'Tất cả', value: '' }];
  employees.value.forEach(e => {
    options.push({ label: e.full_name, value: String(e.id) });
  });
  return options;
});

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatTime = (time) => {
  if (!time) return '-';
  return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusVariant = (status) => {
  const variants = {
    present: 'success',
    late: 'warning',
    absent: 'error',
    half_day: 'info',
    holiday: 'default'
  };
  return variants[status] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    present: 'Có mặt',
    absent: 'Vắng',
    late: 'Đi muộn',
    half_day: 'Nửa ngày',
    holiday: 'Nghỉ lễ',
    leave: 'Nghỉ phép'
  };
  return texts[status] || status;
};

const openCheckInModal = () => {
  checkInForm.value = {
    employee_id: '',
    status: 'present',
    notes: ''
  };
  formError.value = '';
  showCheckInModal.value = true;
};

const openEditModal = (record) => {
  editingRecord.value = record;
  editForm.value = {
    status: record.status || 'present',
    late_minutes: record.late_minutes || 0,
    overtime_hours: record.overtime_hours || 0,
    notes: record.notes || ''
  };
  formError.value = '';
  showEditModal.value = true;
};

const handleCheckIn = async () => {
  if (!checkInForm.value.employee_id) {
    formError.value = 'Vui lòng chọn nhân viên';
    return;
  }

  try {
    saving.value = true;
    formError.value = '';
    
    await attendanceService.checkIn(
      parseInt(checkInForm.value.employee_id),
      checkInForm.value.status
    );
    
    showCheckInModal.value = false;
    await loadData();
  } catch (err) {
    console.error('Error checking in:', err);
    formError.value = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra';
  } finally {
    saving.value = false;
  }
};

const handleCheckOut = async (record) => {
  if (processing.value) return;
  
  try {
    processing.value = true;
    await attendanceService.checkOut(record.id, record.status || 'present');
    await loadData();
  } catch (err) {
    console.error('Error checking out:', err);
    alert(err.response?.data?.error || 'Có lỗi xảy ra khi check-out');
  } finally {
    processing.value = false;
  }
};

const handleUpdate = async () => {
  if (!editingRecord.value) return;

  try {
    saving.value = true;
    formError.value = '';
    
    await attendanceService.update(editingRecord.value.id, {
      status: editForm.value.status,
      late_minutes: parseInt(editForm.value.late_minutes) || 0,
      overtime_hours: parseFloat(editForm.value.overtime_hours) || 0,
      notes: editForm.value.notes
    });
    
    showEditModal.value = false;
    editingRecord.value = null;
    await loadData();
  } catch (err) {
    console.error('Error updating attendance:', err);
    formError.value = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra';
  } finally {
    saving.value = false;
  }
};

const applyFilters = async () => {
  await loadData();
};

const loadData = async () => {
  try {
    loading.value = true;
    
    const params = {};
    if (filters.value.startDate) params.from = filters.value.startDate;
    if (filters.value.endDate) params.to = filters.value.endDate;
    if (filters.value.employee_id) params.employee_id = filters.value.employee_id;
    if (filters.value.status) params.status = filters.value.status;
    
    if (!isAdmin.value) {
      const user = currentUser.value;
      if (user?.employee_id) {
        params.employee_id = user.employee_id;
      }
    }
    
    const response = await attendanceService.getRecords(params);
    records.value = response || [];
    
    if (isAdmin.value) {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = records.value.filter(r => {
        return r.record_date === today;
      });
      
      todaySummary.value = {
        present: todayRecords.filter(r => r.status === 'present').length,
        absent: todayRecords.filter(r => r.status === 'absent').length,
        late: todayRecords.filter(r => r.status === 'late').length,
        halfDay: todayRecords.filter(r => r.status === 'half_day').length
      };
    }
  } catch (err) {
    console.error('Error loading attendance:', err);
    records.value = [];
    todaySummary.value = { present: 0, absent: 0, late: 0, halfDay: 0 };
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    filters.value.startDate = firstDayOfMonth.toISOString().split('T')[0];
    filters.value.endDate = today.toISOString().split('T')[0];
    
    if (isAdmin.value) {
      const [_, employeesRes] = await Promise.all([
        loadData(),
        employeeService.getAll().catch(() => [])
      ]);
      
      employees.value = employeesRes?.data || employeesRes || [];
    } else {
      await loadData();
      const user = currentUser.value;
      if (user?.employee_id) {
        clockEmployeeId.value = String(user.employee_id);
      }
    }
  } catch (err) {
    console.error('Error initializing:', err);
  }
});

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval);
  }
});
</script>
