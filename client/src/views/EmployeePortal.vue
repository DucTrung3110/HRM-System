<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Cổng Nhân viên</h1>
      <p class="text-muted-foreground mt-1">Xem thông tin cá nhân, yêu cầu nghỉ phép và chấm công</p>
    </div>

    <!-- Personal Info Card -->
    <BaseCard>
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
          {{ getInitials(currentEmployee.full_name) }}
        </div>
        <div>
          <h2 class="text-2xl font-bold">{{ currentEmployee.full_name }}</h2>
          <p class="text-muted-foreground">Mã NV: {{ currentEmployee.code }}</p>
          <p class="text-muted-foreground">{{ currentEmployee.job_title?.name || '-' }} | {{ currentEmployee.department?.name || '-' }}</p>
        </div>
      </div>
    </BaseCard>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-border">
      <button
        @click="activeTab = 'attendance'"
        :class="['px-4 py-2 font-medium', activeTab === 'attendance' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground']"
      >
        Chấm công
      </button>
      <button
        @click="activeTab = 'leaves'"
        :class="['px-4 py-2 font-medium', activeTab === 'leaves' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground']"
      >
        Yêu cầu nghỉ phép
      </button>
      <button
        @click="activeTab = 'salary'"
        :class="['px-4 py-2 font-medium', activeTab === 'salary' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground']"
      >
        Lương
      </button>
    </div>

    <!-- Attendance Tab -->
    <div v-if="activeTab === 'attendance'">
      <BaseCard>
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="text-center p-4 rounded-lg bg-success/10">
            <p class="text-2xl font-bold text-success">{{ attendanceStats.present }}</p>
            <p class="text-sm text-muted-foreground">Có mặt</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-destructive/10">
            <p class="text-2xl font-bold text-destructive">{{ attendanceStats.absent }}</p>
            <p class="text-sm text-muted-foreground">Vắng mặt</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-warning/10">
            <p class="text-2xl font-bold text-warning">{{ attendanceStats.late }}</p>
            <p class="text-sm text-muted-foreground">Muộn</p>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="font-semibold">Chấm công gần đây</h3>
          <BaseTable
            :columns="[
              { key: 'record_date', label: 'Ngày' },
              { key: 'check_in_time', label: 'Giờ vào' },
              { key: 'check_out_time', label: 'Giờ ra' },
              { key: 'status', label: 'Trạng thái' }
            ]"
            :data="attendanceRecords.slice(0, 10)"
          />
        </div>
      </BaseCard>
    </div>

    <!-- Leaves Tab -->
    <div v-if="activeTab === 'leaves'">
      <BaseCard>
        <div class="mb-6">
          <h3 class="font-semibold mb-4">Số ngày nghỉ phép còn lại</h3>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="balance in leaveBalances" :key="balance.id" class="p-4 border rounded-lg">
              <p class="font-medium">{{ balance.leave_type?.name }}</p>
              <p class="text-2xl font-bold text-primary">{{ balance.remaining }}</p>
              <p class="text-sm text-muted-foreground">ngày</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Yêu cầu gần đây</h3>
            <BaseButton @click="showLeaveModal = true">Tạo yêu cầu</BaseButton>
          </div>
          <BaseTable
            :columns="[
              { key: 'start_date', label: 'Từ ngày' },
              { key: 'end_date', label: 'Đến ngày' },
              { key: 'leave_type_id', label: 'Loại' },
              { key: 'status', label: 'Trạng thái' }
            ]"
            :data="leaveRequests.slice(0, 10)"
          />
        </div>
      </BaseCard>
    </div>

    <!-- Salary Tab -->
    <div v-if="activeTab === 'salary'">
      <BaseCard>
        <div class="space-y-4">
          <h3 class="font-semibold">Thông tin lương</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 border rounded-lg">
              <p class="text-sm text-muted-foreground">Lương cơ bản</p>
              <p class="text-2xl font-bold">{{ formatCurrency(salary.basic) }}</p>
            </div>
            <div class="p-4 border rounded-lg">
              <p class="text-sm text-muted-foreground">Phụ cấp</p>
              <p class="text-2xl font-bold">{{ formatCurrency(salary.allowances) }}</p>
            </div>
            <div class="p-4 border rounded-lg">
              <p class="text-sm text-muted-foreground">Khấu trừ</p>
              <p class="text-2xl font-bold text-destructive">{{ formatCurrency(salary.deductions) }}</p>
            </div>
            <div class="p-4 border rounded-lg bg-primary/5">
              <p class="text-sm text-muted-foreground">Lương ròng</p>
              <p class="text-2xl font-bold text-primary">{{ formatCurrency(salary.net) }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseTable from '../components/BaseTable.vue';

const activeTab = ref('attendance');
const showLeaveModal = ref(false);

const currentEmployee = ref({
  code: 'EMP001',
  full_name: 'Nhân viên',
  job_title: { name: 'Vị trí' },
  department: { name: 'Phòng ban' }
});

const attendanceStats = ref({
  present: 18,
  absent: 2,
  late: 1
});

const attendanceRecords = ref([]);
const leaveBalances = ref([]);
const leaveRequests = ref([]);

const salary = ref({
  basic: 10000000,
  allowances: 2000000,
  deductions: 1500000,
  net: 10500000
});

const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

onMounted(() => {
  // Mock data for UI preview
  currentEmployee.value = {
    id: 1,
    code: 'EMP001',
    full_name: 'Nguyễn Văn A',
    job_title: { name: 'Senior Developer' },
    department: { name: 'IT Department' }
  };
  
  attendanceStats.value = {
    present: 18,
    absent: 2,
    late: 1
  };
  
  attendanceRecords.value = [
    { id: 1, record_date: '2025-01-23', check_in_time: '07:45', check_out_time: '17:30', status: 'Có mặt' },
    { id: 2, record_date: '2025-01-22', check_in_time: '08:15', check_out_time: '17:30', status: 'Muộn' },
    { id: 3, record_date: '2025-01-21', check_in_time: '07:50', check_out_time: '17:30', status: 'Có mặt' },
    { id: 4, record_date: '2025-01-20', check_in_time: '07:55', check_out_time: '17:35', status: 'Có mặt' },
    { id: 5, record_date: '2025-01-19', check_in_time: '08:00', check_out_time: '17:30', status: 'Có mặt' },
    { id: 6, record_date: '2025-01-18', check_in_time: '07:58', check_out_time: '17:28', status: 'Có mặt' },
    { id: 7, record_date: '2025-01-17', check_in_time: '08:05', check_out_time: '17:30', status: 'Muộn' },
    { id: 8, record_date: '2025-01-16', check_in_time: '07:50', check_out_time: '17:30', status: 'Có mặt' },
    { id: 9, record_date: '2025-01-15', check_in_time: '07:48', check_out_time: '17:32', status: 'Có mặt' },
    { id: 10, record_date: '2025-01-14', check_in_time: '07:52', check_out_time: '17:30', status: 'Có mặt' },
  ];
  
  leaveBalances.value = [
    { id: 1, leave_type: { name: 'Phép năm' }, remaining: 15 },
    { id: 2, leave_type: { name: 'Phép bệnh' }, remaining: 5 },
    { id: 3, leave_type: { name: 'Phép không lương' }, remaining: 0 },
  ];
  
  leaveRequests.value = [
    { id: 1, start_date: '2025-02-20', end_date: '2025-02-22', leave_type_id: 1, leave_type: { name: 'Phép năm' }, status: 'Chờ duyệt' },
    { id: 2, start_date: '2025-01-15', end_date: '2025-01-15', leave_type_id: 2, leave_type: { name: 'Phép bệnh' }, status: 'Đã duyệt' },
    { id: 3, start_date: '2024-12-24', end_date: '2024-12-26', leave_type_id: 1, leave_type: { name: 'Phép năm' }, status: 'Đã duyệt' },
  ];
  
  salary.value = {
    basic: 10000000,
    allowances: 2000000,
    deductions: 1500000,
    net: 10500000
  };
});
</script>
