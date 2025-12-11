<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
      <p class="text-muted-foreground mt-1">Tổng quan hệ thống quản lý nhân sự</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">Đang tải dữ liệu từ API...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Lỗi kết nối API:</p>
      <p class="text-destructive/80 text-sm mt-1">{{ error }}</p>
      <p class="text-muted-foreground text-xs mt-2">Vui lòng đăng nhập để xem dữ liệu</p>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <BaseCard hoverable data-testid="card-total-employees" class="p-6 overflow-hidden relative group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <IconUser class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-muted-foreground font-medium mb-1">Tổng nhân viên</p>
            <p class="text-3xl font-bold text-foreground tracking-tight">{{ stats.totalEmployees }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard hoverable data-testid="card-total-departments" class="p-6 overflow-hidden relative group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl gradient-info flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <IconBuilding class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-muted-foreground font-medium mb-1">Phòng ban</p>
            <p class="text-3xl font-bold text-foreground tracking-tight">{{ stats.activeDepartments }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard hoverable data-testid="card-pending-leaves" class="p-6 overflow-hidden relative group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl gradient-warning flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <IconCalendar class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-muted-foreground font-medium mb-1">Đơn chờ duyệt</p>
            <p class="text-3xl font-bold text-foreground tracking-tight">{{ stats.pendingLeaves }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard hoverable data-testid="card-today-attendance" class="p-6 overflow-hidden relative group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl gradient-success flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <IconClock class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-muted-foreground font-medium mb-1">Có mặt hôm nay</p>
            <p class="text-3xl font-bold text-foreground tracking-tight">{{ stats.todayAttendance.present }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Charts Section -->
    <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <BaseCard title="Thống kê chấm công 30 ngày">
        <div class="h-48 sm:h-64">
          <Bar v-if="attendanceChartData.labels.length > 0" :data="attendanceChartData" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground text-sm sm:text-base">
            <div class="text-center">
              <IconClock class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">Chưa có dữ liệu chấm công</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Yêu cầu nghỉ phép theo trạng thái">
        <div class="h-48 sm:h-64">
          <Doughnut v-if="leaveChartData.labels.length > 0" :data="leaveChartData" :options="doughnutOptions" />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground text-sm sm:text-base">
            <div class="text-center">
              <IconCalendar class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">Chưa có dữ liệu nghỉ phép</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Recent Activities -->
    <BaseCard v-if="!loading && !error" title="Hoạt động gần đây">
      <div v-if="activitiesLoading" class="text-center py-8 text-muted-foreground">
        Đang tải hoạt động...
      </div>
      <div v-else-if="activities.length === 0" class="text-center py-8 text-muted-foreground">
        Chưa có hoạt động nào
      </div>
      <div v-else class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getActivityIconClass(activity.action)">
            <component :is="getActivityIcon(activity.action)" class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-foreground">{{ formatActivityDescription(activity) }}</p>
            <p class="text-xs text-muted-foreground">{{ activity.table_name }} #{{ activity.record_id }}</p>
          </div>
          <span class="text-xs text-muted-foreground">{{ formatTime(activity.at) }}</span>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import BaseCard from '../components/BaseCard.vue';
import IconUser from '../components/IconUser.vue';
import IconBuilding from '../components/IconBuilding.vue';
import IconCalendar from '../components/IconCalendar.vue';
import IconClock from '../components/IconClock.vue';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { leaveService } from '../services/leaveService';
import { attendanceService } from '../services/attendanceService';
import { activityLogService } from '../services/activityLogService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const loading = ref(true);
const activitiesLoading = ref(true);
const error = ref('');
const activities = ref([]);
const attendanceRecords = ref([]);
const leaveRequests = ref([]);

const stats = ref({
  totalEmployees: 0,
  activeDepartments: 0,
  pendingLeaves: 0,
  todayAttendance: {
    present: 0,
    absent: 0,
    late: 0
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right'
    }
  }
};

const attendanceChartData = computed(() => {
  if (attendanceRecords.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const last30Days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30Days.push(d.toISOString().split('T')[0]);
  }

  const presentCounts = last30Days.map(date => {
    return attendanceRecords.value.filter(r => r.record_date === date && r.status === 'present').length;
  });

  const lateCounts = last30Days.map(date => {
    return attendanceRecords.value.filter(r => r.record_date === date && r.status === 'late').length;
  });

  const absentCounts = last30Days.map(date => {
    return attendanceRecords.value.filter(r => r.record_date === date && r.status === 'absent').length;
  });

  const labels = last30Days.map(date => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  return {
    labels,
    datasets: [
      {
        label: 'Có mặt',
        data: presentCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Đi muộn',
        data: lateCounts,
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 1
      },
      {
        label: 'Vắng',
        data: absentCounts,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };
});

const leaveChartData = computed(() => {
  if (leaveRequests.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const statusCounts = {
    pending: 0,
    approved: 0,
    rejected: 0
  };

  leaveRequests.value.forEach(req => {
    if (statusCounts.hasOwnProperty(req.status)) {
      statusCounts[req.status]++;
    }
  });

  return {
    labels: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'],
    datasets: [
      {
        data: [statusCounts.pending, statusCounts.approved, statusCounts.rejected],
        backgroundColor: [
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };
});

function getActivityIcon(action) {
  switch (action) {
    case 'create':
    case 'insert':
      return IconUser;
    case 'update':
      return IconBuilding;
    case 'delete':
      return IconCalendar;
    default:
      return IconClock;
  }
}

function getActivityIconClass(action) {
  switch (action) {
    case 'create':
    case 'insert':
      return 'bg-success/20 text-success';
    case 'update':
      return 'bg-info/20 text-info';
    case 'delete':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function formatActivityDescription(activity) {
  const actionMap = {
    'create': 'Tạo mới',
    'insert': 'Thêm',
    'update': 'Cập nhật',
    'delete': 'Xóa'
  };
  const action = actionMap[activity.action] || activity.action;
  return `${action} ${activity.table_name}`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

async function fetchActivities() {
  try {
    activitiesLoading.value = true;
    const data = await activityLogService.getAll();
    activities.value = Array.isArray(data) ? data.slice(0, 10) : [];
  } catch (err) {
    console.error('Error loading activities:', err);
    activities.value = [];
  } finally {
    activitiesLoading.value = false;
  }
}

async function fetchLeaveRequests() {
  try {
    const data = await leaveService.getRequests();
    leaveRequests.value = Array.isArray(data) ? data : [];
    stats.value.pendingLeaves = leaveRequests.value.filter(r => r.status === 'pending').length;
  } catch (err) {
    console.error('Error loading leave requests:', err);
    leaveRequests.value = [];
  }
}

async function fetchAttendance() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const data = await attendanceService.getRecords({ from: fromDate, to: today });
    attendanceRecords.value = Array.isArray(data) ? data : [];

    const todayRecords = attendanceRecords.value.filter(r => r.record_date === today);
    stats.value.todayAttendance = {
      present: todayRecords.filter(r => r.status === 'present').length,
      late: todayRecords.filter(r => r.status === 'late').length,
      absent: todayRecords.filter(r => r.status === 'absent').length
    };
  } catch (err) {
    console.error('Error loading attendance:', err);
    attendanceRecords.value = [];
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [employeesRes, departmentsRes] = await Promise.all([
      employeeService.getAll(),
      departmentService.getAll()
    ]);
    
    const employees = employeesRes?.data || employeesRes || [];
    const departments = departmentsRes?.data || departmentsRes || [];
    
    stats.value.totalEmployees = Array.isArray(employees) ? employees.length : 0;
    stats.value.activeDepartments = Array.isArray(departments) ? departments.length : 0;
    
    await Promise.all([
      fetchLeaveRequests(),
      fetchAttendance(),
      fetchActivities()
    ]);
    
  } catch (err) {
    console.error('Dashboard API Error:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể kết nối đến API';
  } finally {
    loading.value = false;
  }
});
</script>
