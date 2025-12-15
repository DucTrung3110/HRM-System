import { createRouter, createWebHistory } from 'vue-router';

const ADMIN_ONLY_ROUTES = [
  '/employees',
  '/departments',
  '/roles',
  '/job-titles',
  '/job-families',
  '/employment-history',
  '/salary-components',
  '/portal'
];

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: 'Dashboard', requiresAuth: true, adminOnly: true }
      },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('../views/Employees.vue'),
        meta: { title: 'Quản lý Nhân viên', adminOnly: true }
      },
      {
        path: 'employees/:id',
        name: 'employee-detail',
        component: () => import('../views/EmployeeDetail.vue'),
        meta: { title: 'Chi tiết Nhân viên', adminOnly: true }
      },
      {
        path: 'departments',
        name: 'departments',
        component: () => import('../views/Departments.vue'),
        meta: { title: 'Quản lý Phòng ban', adminOnly: true }
      },
      {
        path: 'attendance',
        name: 'attendance',
        component: () => import('../views/Attendance.vue'),
        meta: { title: 'Chấm công' }
      },
      {
        path: 'leaves',
        name: 'leaves',
        component: () => import('../views/Leaves.vue'),
        meta: { title: 'Nghỉ phép' }
      },
      {
        path: 'salaries',
        name: 'salaries',
        component: () => import('../views/Salaries.vue'),
        meta: { title: 'Lương' }
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('../views/Roles.vue'),
        meta: { title: 'Vai trò & Phân quyền', adminOnly: true }
      },
      {
        path: 'job-titles',
        name: 'job-titles',
        component: () => import('../views/JobTitles.vue'),
        meta: { title: 'Quản lý Chức danh', adminOnly: true }
      },
      {
        path: 'job-families',
        name: 'job-families',
        component: () => import('../views/JobFamilies.vue'),
        meta: { title: 'Quản lý Nhóm chức danh', adminOnly: true }
      },
      {
        path: 'employment-history',
        name: 'employment-history',
        component: () => import('../views/EmploymentHistory.vue'),
        meta: { title: 'Quản lý Lịch sử công tác', adminOnly: true }
      },
      {
        path: 'work-shifts',
        name: 'work-shifts',
        component: () => import('../views/WorkShifts.vue'),
        meta: { title: 'Ca làm việc', adminOnly: true }
      },
      {
        path: 'work-schedules',
        name: 'work-schedules',
        component: () => import('../views/WorkSchedules.vue'),
        meta: { title: 'Lịch làm việc' }
      },
      {
        path: 'salary-components',
        name: 'salary-components',
        component: () => import('../views/SalaryComponents.vue'),
        meta: { title: 'Quản lý Thành phần lương', adminOnly: true }
      },
      {
        path: 'portal',
        name: 'portal',
        component: () => import('../views/EmployeePortal.vue'),
        meta: { title: 'Cổng Nhân viên', adminOnly: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/employee/info',
    name: 'EmployeeInfo',
    component: () => import('../views/EmployeeInfo.vue'),
    meta: { title: 'Thông tin Nhân viên' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  try {
    const token = localStorage.getItem('auth_token');
    const isAuthenticated = !!token;
    const userRole = localStorage.getItem('user_role') || 'employee';
    const isAdmin = userRole === 'admin';

    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login');
      return;
    }
    
    if (to.path === '/login' && isAuthenticated) {
      next(isAdmin ? '/' : '/attendance');
      return;
    }
    
    if (to.meta.adminOnly && !isAdmin) {
      next('/attendance');
      return;
    }

    document.title = `${to.meta.title || 'HRM'} | Hệ thống Quản lý Nhân sự`;
    next();
  } catch (error) {
    console.error('Router guard error:', error);
    next('/login');
  }
});

export default router;