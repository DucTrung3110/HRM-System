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
          <!-- Search with Dropdown -->
          <div class="relative hidden md:block" ref="searchContainerRef">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Tìm kiếm trang..."
              class="w-64 px-4 py-2 pl-10 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-global-search"
              @focus="isSearchFocused = true"
              @keydown.enter="handleSearchEnter"
              @keydown.down.prevent="navigateSearchResults(1)"
              @keydown.up.prevent="navigateSearchResults(-1)"
              @keydown.escape="closeSearch"
            />
            <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            <!-- Search Results Dropdown -->
            <div 
              v-if="isSearchFocused && (searchQuery.trim() || filteredNavItems.length > 0)"
              class="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50"
            >
              <div v-if="filteredNavItems.length === 0 && searchQuery.trim()" class="p-3 text-muted-foreground text-sm text-center">
                Không tìm thấy trang nào
              </div>
              <div v-else class="py-1">
                <div
                  v-for="(item, index) in filteredNavItems"
                  :key="item.path"
                  @click="navigateToPage(item)"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                    selectedSearchIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  ]"
                >
                  <component :is="item.icon" class="w-4 h-4" />
                  <span class="text-sm">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <ThemeToggle />

          <!-- Notifications -->
          <div class="relative" ref="notificationContainerRef">
            <button 
              @click="toggleNotifications"
              class="relative p-2 rounded-lg hover-elevate active-elevate-2" 
              data-testid="button-notifications"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                {{ unreadCount }}
              </span>
            </button>
            
            <!-- Notifications Dropdown -->
            <div 
              v-if="isNotificationsOpen"
              class="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 class="font-semibold text-sm">Thông báo</h3>
                <button 
                  @click="markAllAsRead"
                  class="text-xs text-primary hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
              <div class="max-h-64 overflow-y-auto">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  :class="[
                    'flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors',
                    !notification.read ? 'bg-primary/5' : ''
                  ]"
                  @click="markAsRead(notification.id)"
                >
                  <div :class="[
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    notification.read ? 'bg-muted-foreground/30' : 'bg-primary'
                  ]"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm">{{ notification.message }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ notification.time }}</p>
                  </div>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="p-4 text-center text-muted-foreground text-sm">
                Không có thông báo mới
              </div>
            </div>
          </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '../services/authService';
import { useNotificationStore } from '../stores/notificationStore';
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

const searchQuery = ref('');
const isSearchFocused = ref(false);
const selectedSearchIndex = ref(0);
const searchContainerRef = ref(null);

const isNotificationsOpen = ref(false);
const notificationContainerRef = ref(null);

const notificationStore = useNotificationStore();
const storeNotifications = notificationStore.notifications;
const storeUnreadCount = notificationStore.unreadCount;

const notifications = computed(() => {
  return storeNotifications.value.map(n => ({
    id: n.id,
    message: n.message,
    time: formatTime(n.timestamp),
    read: n.read
  }));
});

const unreadCount = computed(() => storeUnreadCount.value);

const formatTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return 'Hôm qua';
  return `${days} ngày trước`;
};

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

const filteredNavItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return navItems;
  return navItems.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.name.toLowerCase().includes(query) ||
    item.path.toLowerCase().includes(query)
  );
});

const currentPageTitle = computed(() => {
  const item = navItems.find(i => i.path === route.path);
  return item?.label || route.meta.title || 'Dashboard';
});

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

const navigateToPage = (item) => {
  router.push(item.path);
  searchQuery.value = '';
  isSearchFocused.value = false;
  selectedSearchIndex.value = 0;
};

const handleSearchEnter = () => {
  if (filteredNavItems.value.length > 0) {
    navigateToPage(filteredNavItems.value[selectedSearchIndex.value]);
  }
};

const navigateSearchResults = (direction) => {
  const len = filteredNavItems.value.length;
  if (len === 0) return;
  selectedSearchIndex.value = (selectedSearchIndex.value + direction + len) % len;
};

const closeSearch = () => {
  isSearchFocused.value = false;
  searchQuery.value = '';
  selectedSearchIndex.value = 0;
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
};

const markAsRead = (id) => {
  notificationStore.markAsRead(id);
};

const markAllAsRead = () => {
  notificationStore.markAllAsRead();
};

const handleClickOutside = (event) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    isSearchFocused.value = false;
  }
  if (notificationContainerRef.value && !notificationContainerRef.value.contains(event.target)) {
    isNotificationsOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
