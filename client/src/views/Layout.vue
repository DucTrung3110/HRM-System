<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="h-16 flex items-center justify-center px-6 border-b border-sidebar-border relative">
        <h1 class="text-2xl font-bold" style="font-family: 'Montserrat', sans-serif;">
          <span class="font-extrabold" style="color: #124DA3;">CODE</span><span class="font-extrabold" style="color: #F37022;">DEN</span><span class="font-extrabold" style="color: #4EB748;">NGU</span>
        </h1>
        <button 
          @click="isMobileMenuOpen = false"
          class="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg absolute right-6"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive(item.path) 
            ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary' 
            : 'text-sidebar-foreground hover-elevate'"
        >
          <component :is="item.icon" class="flex-shrink-0 w-5 h-5" />
          <span class="font-medium text-sm">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden lg:ml-64">
      <!-- Top Bar -->
      <header class="h-16 border-b border-border bg-background px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <button
            @click="isMobileMenuOpen = true"
            class="p-2 rounded-lg hover-elevate active-elevate-2 lg:hidden"
            data-testid="button-sidebar-toggle"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Breadcrumbs -->
          <div class="flex items-center gap-2 text-sm">
            <router-link to="/" class="text-muted-foreground hover:text-foreground">Home</router-link>
            <span class="text-muted-foreground">/</span>
            <span class="text-foreground font-medium">{{ currentPageTitle }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Search -->
          <div class="relative hidden md:block">
            <input
              type="search"
              placeholder="Tìm kiếm..."
              class="w-64 px-4 py-2 pl-10 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-global-search"
            />
            <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <ThemeToggle />

          <!-- Notifications -->
          <button class="relative p-2 rounded-lg hover-elevate active-elevate-2" data-testid="button-notifications">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          <!-- Logout -->
          <button 
            @click="handleLogout"
            class="p-2 rounded-lg hover-elevate active-elevate-2 text-destructive"
            data-testid="button-logout"
            title="Đăng xuất"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle.vue';
import IconDashboard from '../components/IconDashboard.vue';
import IconUser from '../components/IconUser.vue';
import IconBuilding from '../components/IconBuilding.vue';
import IconClock from '../components/IconClock.vue';
import IconCalendar from '../components/IconCalendar.vue';
import IconCash from '../components/IconCash.vue';
import IconShield from '../components/IconShield.vue';

const route = useRoute();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const handleLogout = () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    authService.logout();
    router.push('/login');
  }
};

const navItems = [
  { path: '/', name: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { path: '/employees', name: 'employees', label: 'Nhân viên', icon: IconUser },
  { path: '/departments', name: 'departments', label: 'Phòng ban', icon: IconBuilding },
  { path: '/attendance', name: 'attendance', label: 'Chấm công', icon: IconClock },
  { path: '/leaves', name: 'leaves', label: 'Nghỉ phép', icon: IconCalendar },
  { path: '/salaries', name: 'salaries', label: 'Lương', icon: IconCash },
  { path: '/roles', name: 'roles', label: 'Vai trò', icon: IconShield },
  { path: '/job-titles', name: 'job-titles', label: 'Chức danh', icon: IconUser },
  { path: '/job-families', name: 'job-families', label: 'Nhóm chức danh', icon: IconBuilding },
  { path: '/employment-history', name: 'employment-history', label: 'Lịch sử công tác', icon: IconUser },
  { path: '/work-shifts', name: 'work-shifts', label: 'Ca làm việc', icon: IconClock },
  { path: '/work-schedules', name: 'work-schedules', label: 'Lên lịch', icon: IconCalendar },
  { path: '/salary-components', name: 'salary-components', label: 'Thành phần lương', icon: IconCash },
  { path: '/portal', name: 'portal', label: 'Cổng nhân viên', icon: IconUser },
];

const currentPageTitle = computed(() => {
  const item = navItems.find(i => i.path === route.path);
  return item?.label || route.meta.title || 'Dashboard';
});

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};
</script>