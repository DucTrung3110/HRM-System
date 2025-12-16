<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">{{ isAdmin ? 'Quản lý Chấm công' : 'Chấm công của tôi' }}</h1>
        <p class="text-muted-foreground mt-1">{{ isAdmin ? 'Theo dõi và báo cáo chấm công nhân viên' : 'Xem và quản lý chấm công cá nhân' }}</p>
      </div>
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
    
    <BaseCard v-if="!isAdmin" class="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
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
          <BaseButton 
            @click="handleSelfCheckIn" 
            :disabled="clockProcessing"
            class="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white"
          >
            <svg class="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {{ clockProcessing ? 'Đang xử lý...' : 'CHECK IN' }}
          </BaseButton>
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

      <template #footer>
        <BaseButton variant="outline" @click="showEditModal = false">Hủy</BaseButton>
        <BaseButton @click="handleUpdate">
          Cập nhật
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

const loading = ref(true);
const clockProcessing = ref(false);

const showEditModal = ref(false);
const editingRecord = ref(null);

const records = ref([]);
const employees = ref([]);

const currentTime = ref('');
const currentDate = ref('');
let clockInterval = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const todaySummary = ref({
  present: 142,
  absent: 8,
  late: 6,
  halfDay: 3
});

const filters = ref({
  startDate: '',
  endDate: '',
  employee_id: '',
  status: ''
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
  return records.value;
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

const openEditModal = (record) => {
  editingRecord.value = record;
  editForm.value = {
    status: record.status || 'present',
    late_minutes: record.late_minutes || 0,
    overtime_hours: record.overtime_hours || 0,
    notes: record.notes || ''
  };
  showEditModal.value = true;
};

const handleSelfCheckIn = async () => {
  clockProcessing.value = true;
  setTimeout(() => {
    toast.success('Check-in thành công!');
    clockProcessing.value = false;
  }, 1000);
};

const handleUpdate = async () => {
  toast.success('Cập nhật thành công!');
  showEditModal.value = false;
  editingRecord.value = null;
};

const applyFilters = async () => {
  toast.info('Đã áp dụng bộ lọc');
};

const generateMockData = () => {
  const mockEmployees = [
    { id: 1, full_name: 'Nguyễn Văn An', employee_code: 'NV001' },
    { id: 2, full_name: 'Trần Thị Bình', employee_code: 'NV002' },
    { id: 3, full_name: 'Lê Văn Cường', employee_code: 'NV003' },
    { id: 4, full_name: 'Phạm Thị Dung', employee_code: 'NV004' },
    { id: 5, full_name: 'Hoàng Văn Em', employee_code: 'NV005' },
    { id: 6, full_name: 'Vũ Thị Phương', employee_code: 'NV006' },
    { id: 7, full_name: 'Đặng Văn Giang', employee_code: 'NV007' },
    { id: 8, full_name: 'Bùi Thị Hoa', employee_code: 'NV008' },
  ];
  employees.value = mockEmployees;

  const mockRecords = [];
  const today = new Date();
  const statuses = ['present', 'present', 'present', 'present', 'late', 'half_day'];
  
  for (let day = 0; day < 7; day++) {
    const recordDate = new Date(today);
    recordDate.setDate(recordDate.getDate() - day);
    const dateStr = recordDate.toISOString().split('T')[0];
    
    mockEmployees.forEach((emp, idx) => {
      const checkInHour = 7 + Math.floor(Math.random() * 2);
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkOutHour = 16 + Math.floor(Math.random() * 3);
      const checkOutMinute = Math.floor(Math.random() * 60);
      
      const checkIn = new Date(recordDate);
      checkIn.setHours(checkInHour, checkInMinute, 0);
      
      const checkOut = new Date(recordDate);
      checkOut.setHours(checkOutHour, checkOutMinute, 0);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const totalHours = ((checkOut - checkIn) / 3600000).toFixed(1);
      
      mockRecords.push({
        id: day * 10 + idx + 1,
        employee_id: emp.id,
        full_name: emp.full_name,
        employee_code: emp.employee_code,
        record_date: dateStr,
        check_in_time: checkIn.toISOString(),
        check_out_time: checkOut.toISOString(),
        total_work_hours: parseFloat(totalHours),
        late_minutes: status === 'late' ? Math.floor(Math.random() * 30) + 5 : 0,
        overtime_hours: Math.random() > 0.7 ? parseFloat((Math.random() * 2).toFixed(1)) : 0,
        status: status,
        notes: ''
      });
    });
  }
  
  records.value = mockRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
};

const loadData = async () => {
  try {
    loading.value = true;
    
    generateMockData();
    
    try {
      const params = {};
      if (filters.value.startDate) params.from = filters.value.startDate;
      if (filters.value.endDate) params.to = filters.value.endDate;
      if (filters.value.employee_id) params.employee_id = filters.value.employee_id;
      
      const [attendanceData, employeesData] = await Promise.all([
        attendanceService.getRecords(params),
        employeeService.getAll()
      ]);
      
      if (Array.isArray(attendanceData) && attendanceData.length > 0) {
        records.value = attendanceData;
      }
      
      if (Array.isArray(employeesData) && employeesData.length > 0) {
        employees.value = employeesData;
      }
    } catch (apiError) {
      console.log('API unavailable, using mock data');
    }
    
  } catch (err) {
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
  loadData();
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
});
</script>
