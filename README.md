# HR Management System (HRM)

Hệ thống quản lý nhân sự toàn diện được xây dựng bằng **Vue.js**, **PHP/Laravel** và **MySQL**. Ứng dụng này quản lý nhân viên, phòng ban, chấm công, nghỉ phép, lương và các quy trình HR cốt lõi.

## 🎯 Tính Năng Chính

- **Quản lý Nhân viên**: CRUD đầy đủ hồ sơ nhân viên
- **Quản lý Phòng ban**: Cấu trúc phân cấp cha-con
- **Quản lý Vai trò & Phân quyền**: RBAC đầy đủ
- **Chức danh & Nhóm chức danh**: Phân loại công việc
- **Chấm công & Lịch làm việc**: Quản lý ca làm việc, thời gian công
- **Quản lý Nghỉ phép**: Yêu cầu, phê duyệt, số dư
- **Quản lý Lương**: Thành phần lương, thiết lập
- **Nhân viên Portal**: Tự phục vụ truy cập dữ liệu cá nhân
- **Dashboard**: Thống kê & báo cáo
- **Xác thực & Phân quyền**: 4 vai trò (Admin, HR, Manager, Staff)

## 🛠️ Tech Stack

| Thành Phần | Công Nghệ |
|-----------|----------|
| Frontend | Vue.js, Axios |
| Styling | Tailwind CSS, Radix UI |
| Backend | PHP 8.0+, Laravel 10+ |
| Database | MySQL 5.7+ / MariaDB 10.3+ |
| Architecture | MVC, Database 3NF |

## 📋 Database Schema

**15 Bảng chính:**
- **System**: users, roles, activity_logs
- **Organization**: departments, job_families, job_titles
- **HR**: employees, employment_histories
- **Time & Attendance**: leave_types, leave_balances, leave_requests, work_shifts, work_schedules, attendance_records
- **Payroll**: salary_components, employee_salaries

## 🚀 Cài Đặt & Chạy

### Yêu Cầu
- PHP 8.0+, Composer
- Node.js 16+, npm
- MySQL 5.7+

### Backend Setup

```bash
# Cài đặt dependencies
composer install

# Copy .env
cp .env.example .env

# Generate key
php artisan key:generate

# Database migration
php artisan migrate

# Seed dữ liệu (tùy chọn)
php artisan db:seed

# Khởi động server
php artisan serve
```

Backend chạy trên: **http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động dev server
npm run dev
```

Frontend chạy trên: **http://localhost:5173**

## 📖 Cấu Trúc Dự Án

```
├── frontend/                  # Vue.js Frontend Application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── assets/            # CSS, Images, Fonts
│   │   ├── components/        # Reusable Vue components
│   │   ├── views/             # Page components (Dashboard, Employees, etc.)
│   │   ├── router/            # Vue Router config
│   │   ├── services/          # API service calls (Axios)
│   │   ├── stores/            # State Management (Pinia)
│   │   ├── utils/             # Helper functions
│   │   ├── App.vue            # Root component
│   │   └── main.js            # Entry point
│   ├── index.html
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── vite.config.js         # Vite config
│   └── package.json           # Frontend dependencies
│
├── backend/                   # Laravel Backend Application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API Controllers
│   │   │   ├── Middleware/    # Auth & Role Middleware
│   │   │   └── Requests/      # Validation Logic
│   │   └── Models/            # Eloquent Models
│   ├── config/                # App configuration files
│   ├── database/
│   │   ├── migrations/        # Database schema definitions
│   │   └── seeders/           # Fake data generators
│   ├── routes/
│   │   ├── api.php            # API Endpoints
│   │   └── web.php
│   ├── storage/               # Logs, Uploaded files
│   ├── .env.example           # Environment template
│   ├── artisan                # Laravel CLI
│   ├── composer.json          # Backend dependencies
│   └── phpunit.xml            # Testing config
│
└── README.md                  # Project documentation
```

## 🔐 Bảo Mật

- ✅ Xác thực session (Laravel)
- ✅ Mã hóa mật khẩu (bcrypt)
- ✅ RBAC (Role-Based Access Control)
- ✅ Nhật ký hoạt động (audit logs)

## 📝 Các Lệnh Chủ Yếu

**Backend:**
```bash
php artisan serve              # Dev server
php artisan migrate            # Chạy migrations
php artisan db:seed            # Seed data
php artisan make:controller    # Tạo controller
php artisan make:model         # Tạo model
```

**Frontend:**
```bash
npm run dev                    # Dev server
npm run build                  # Build production
npm run preview                # Preview build
```

## 📊 Vai Trò Người Dùng

1. **Admin**: Quản lý hệ thống, danh mục, cấu hình
2. **HR**: Quản lý nhân viên, chấm công, lương
3. **Manager**: Phê duyệt nghỉ phép, xem lịch làm việc
4. **Staff**: Xem thông tin cá nhân, xin nghỉ phép

## 🎨 Giao Diện

- Responsive design (desktop & mobile)
- Material Design principles
- Tailwind CSS + Radix UI components

## 📄 License

MIT License - Trường Cao Đẳng Thực Hành FPT Biên Hòa 2025

---

**Version**: 1.0.0  
**Updated**: November 2025
