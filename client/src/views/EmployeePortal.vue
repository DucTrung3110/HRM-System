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
import { ref, onMounted, computed } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseTable from '../components/BaseTable.vue';
import axiosClient from '../services/axiosClient';

const activeTab = ref('attendance');
const showLeaveModal = ref(false);

const currentEmployee = ref({
  code: '',
  full_name: '',
  job_title: { name: '' },
  department: { name: '' }
});

const attendanceStats = ref({
  present: 0,
  absent: 0,
  late: 0
});

const attendanceRecords = ref([]);
const leaveBalances = ref([]);
const leaveRequests = ref([]);

const salary = ref({
  basic: 0,
  allowances: 0,
  deductions: 0,
  net: 0
});

const getInitials = (name) => {
  if (!name) return '';
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

const loadEmployeeInfo = async () => {
  try {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.employee_id) {
      const response = await axiosClient.get(`/employees/${user.employee_id}`);
      currentEmployee.value = response.data;
    }
  } catch (error) {
    console.error('Error loading employee info:', error);
  }
};

const loadAttendanceData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.employee_id) {
      const response = await axiosClient.get('/attendance', {
        params: { employee_id: user.employee_id }
      });
      attendanceRecords.value = response.data;

      // Calculate stats
      const stats = {
        present: 0,
        absent: 0,
        late: 0
      };
      response.data.forEach(record => {
        if (record.status === 'present') stats.present++;
        else if (record.status === 'absent') stats.absent++;
        else if (record.status === 'late') stats.late++;
      });
      attendanceStats.value = stats;
    }
  } catch (error) {
    console.error('Error loading attendance data:', error);
  }
};

const loadLeaveData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.employee_id) {
      // Load leave balances
      const balancesResponse = await axiosClient.get(`/leave-balances/${user.employee_id}`);
      leaveBalances.value = balancesResponse.data;

      // Load leave requests
      const requestsResponse = await axiosClient.get('/leave-requests', {
        params: { employee_id: user.employee_id }
      });
      leaveRequests.value = requestsResponse.data;
    }
  } catch (error) {
    console.error('Error loading leave data:', error);
  }
};

const loadSalaryData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.employee_id) {
      const response = await axiosClient.get(`/employees/${user.employee_id}/salaries`);
      if (response.data && response.data.length > 0) {
        // Calculate totals from salary components
        const salaryData = response.data;
        let basic = 0;
        let allowances = 0;
        let deductions = 0;

        salaryData.forEach(item => {
          if (item.salary_component?.category === 'basic') {
            basic += item.amount;
          } else if (item.salary_component?.type === 'earning') {
            allowances += item.amount;
          } else if (item.salary_component?.type === 'deduction') {
            deductions += item.amount;
          }
        });

        salary.value = {
          basic,
          allowances,
          deductions,
          net: basic + allowances - deductions
        };
      }
    }
  } catch (error) {
    console.error('Error loading salary data:', error);
  }
};

onMounted(async () => {
  await loadEmployeeInfo();
  await Promise.all([
    loadAttendanceData(),
    loadLeaveData(),
    loadSalaryData()
  ]);
});
</script>