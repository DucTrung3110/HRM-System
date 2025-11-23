<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
      <p class="text-muted-foreground mt-1">Tổng quan hệ thống quản lý nhân sự</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <BaseCard class="p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold mb-4">Thống kê chấm công 30 ngày</h3>
        <div class="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm sm:text-base">
          <div class="text-center">
            <IconClock class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p class="text-muted-foreground">Biểu đồ chấm công</p>
            <p class="text-sm text-muted-foreground mt-1">(Sẽ hiển thị khi có dữ liệu từ API)</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold mb-4">Yêu cầu nghỉ phép theo tháng</h3>
        <div class="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm sm:text-base">
          <div class="text-center">
            <IconCalendar class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p class="text-muted-foreground">Biểu đồ nghỉ phép</p>
            <p class="text-sm text-muted-foreground mt-1">(Sẽ hiển thị khi có dữ liệu từ API)</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Recent Activities -->
    <BaseCard title="Hoạt động gần đây" class="p-4 sm:p-6">
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <IconUser class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-foreground">Hoạt động mẫu #{{ i }}</p>
            <p class="text-xs text-muted-foreground">Sẽ hiển thị dữ liệu thực từ API backend</p>
          </div>
          <span class="text-xs text-muted-foreground">{{ i }} phút trước</span>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import IconUser from '../components/IconUser.vue';
import IconBuilding from '../components/IconBuilding.vue';
import IconCalendar from '../components/IconCalendar.vue';
import IconClock from '../components/IconClock.vue';

// Mock data - sẽ được thay thế bằng dữ liệu từ API
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

onMounted(async () => {
  // TODO: Fetch real data from API
  // Giả lập dữ liệu demo
  stats.value = {
    totalEmployees: 156,
    activeDepartments: 12,
    pendingLeaves: 8,
    todayAttendance: {
      present: 142,
      absent: 5,
      late: 9
    }
  };
});
</script>