import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('../views/Employees.vue'),
        meta: { title: 'Quản lý Nhân viên' }
      },
      {
        path: 'employees/:id',
        name: 'employee-detail',
        component: () => import('../views/EmployeeDetail.vue'),
        meta: { title: 'Chi tiết Nhân viên' }
      },
      {
        path: 'departments',
        name: 'departments',
        component: () => import('../views/Departments.vue'),
        meta: { title: 'Quản lý Phòng ban' }
      },
      {
        path: 'attendance',
        name: 'attendance',
        component: () => import('../views/Attendance.vue'),
        meta: { title: 'Quản lý Chấm công' }
      },
      {
        path: 'leaves',
        name: 'leaves',
        component: () => import('../views/Leaves.vue'),
        meta: { title: 'Quản lý Nghỉ phép' }
      },
      {
        path: 'salaries',
        name: 'salaries',
        component: () => import('../views/Salaries.vue'),
        meta: { title: 'Quản lý Lương' }
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('../views/Roles.vue'),
        meta: { title: 'Vai trò & Phân quyền' }
      },
      {
        path: 'job-titles',
        name: 'job-titles',
        component: () => import('../views/JobTitles.vue'),
        meta: { title: 'Quản lý Chức danh' }
      },
      {
        path: 'job-families',
        name: 'job-families',
        component: () => import('../views/JobFamilies.vue'),
        meta: { title: 'Quản lý Nhóm chức danh' }
      },
      {
        path: 'employment-history',
        name: 'employment-history',
        component: () => import('../views/EmploymentHistory.vue'),
        meta: { title: 'Quản lý Lịch sử công tác' }
      },
      {
        path: 'work-shifts',
        name: 'work-shifts',
        component: () => import('../views/WorkShifts.vue'),
        meta: { title: 'Quản lý Ca làm việc' }
      },
      {
        path: 'work-schedules',
        name: 'work-schedules',
        component: () => import('../views/WorkSchedules.vue'),
        meta: { title: 'Quản lý Lên lịch làm việc' }
      },
      {
        path: 'salary-components',
        name: 'salary-components',
        component: () => import('../views/SalaryComponents.vue'),
        meta: { title: 'Quản lý Thành phần lương' }
      },
      {
        path: 'portal',
        name: 'portal',
        component: () => import('../views/EmployeePortal.vue'),
        meta: { title: 'Cổng Nhân viên' }
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
  const user = localStorage.getItem('user');
  const role = JSON.parse(localStorage.getItem('role') || '{}');

  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else if (to.path === '/login' && user) {
    next('/dashboard');
  } else if (to.meta.role && role.code !== to.meta.role) {
    next('/employee/info');
  } else {
    document.title = `${to.meta.title || 'HRM'} | Hệ thống Quản lý Nhân sự`;
    next();
  }
});

export default router;