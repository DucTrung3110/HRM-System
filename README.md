# HR Management System (HRM) 🏢

Một hệ thống quản lý nhân sự toàn diện được xây dựng bằng **Vue.js 3**, **Express.js** và **PostgreSQL**. Ứng dụng này cung cấp các công cụ để quản lý nhân viên, phòng ban, chứng chỉ, lịch công tác, yêu cầu nghỉ phép và thông tin lương.

## 🎯 Tính Năng Chính

- **Quản Lý Nhân Viên**: Tạo, chỉnh sửa, xóa hồ sơ nhân viên với thông tin chi tiết
- **Quản Lý Phòng Ban**: Cấu trúc tổ chức phòng ban theo cấp bậc
- **Quản Lý Vai Trò**: Thiết lập các vai trò và quyền hạn cho người dùng
- **Chứng Chỉ Công Việc**: Quản lý chứng chỉ và danh mục công việc
- **Lịch Làm Việc**: Lập lịch ca làm việc và bảng công tác cho nhân viên
- **Chấm Công**: Theo dõi check-in/check-out với thống kê xu hướng
- **Quản Lý Nghỉ Phép**: Xử lý yêu cầu nghỉ phép với quy trình duyệt
- **Quản Lý Lương**: Quản lý các thành phần lương và tính lương cho nhân viên
- **Lịch Sử Việc Làm**: Theo dõi lịch sử thay đổi vị trí công việc
- **Cổng Nhân Viên**: Tự phục vụ truy cập dữ liệu cá nhân, số dư nghỉ phép và thông tin lương
- **Dashboard**: Các chỉ số chính và thống kê hệ thống

## 🛠️ Tech Stack

| Layer | Công Nghệ |
|-------|-----------|
| **Frontend** | Vue.js 3, Vue Router, Pinia (quản lý trạng thái), Tailwind CSS |
| **Build Tool** | Vite |
| **Backend** | Express.js, Node.js |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Drizzle ORM |
| **Language** | 100% JavaScript (ES6+) |

## 📁 Cấu Trúc Thư Mục

```
├── client/                    # Vue.js frontend
│   ├── src/
│   │   ├── components/        # Các component tái sử dụng
│   │   ├── views/             # Các trang chính
│   │   ├── router/            # Cấu hình Vue Router
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Pinia stores
│   │   ├── types/             # Định nghĩa kiểu dữ liệu (JSDoc)
│   │   └── main.js            # Entry point
│   └── index.html
├── server/                    # Express.js backend
│   ├── index.js               # Tệp chính
│   ├── routes.js              # Định nghĩa tuyến API
│   ├── storage.js             # Cấu hình cơ sở dữ liệu
│   └── vite.js                # Tích hợp Vite dev server
├── shared/                    # Mã dùng chung
│   └── schema.js              # Cơ sở dữ liệu schema (Drizzle)
├── migrations/                # Tệp di chuyển cơ sở dữ liệu
├── figma-exports/             # Tệp HTML/CSS tĩnh cho thiết kế
├── vite.config.js             # Cấu hình Vite
├── tailwind.config.js         # Cấu hình Tailwind CSS
├── drizzle.config.js          # Cấu hình Drizzle ORM
└── package.json               # Phụ thuộc dự án
```

## 🗄️ Database Schema

Hệ thống bao gồm các bảng chính:

- **Users** - Xác thực người dùng
- **Roles** - Vai trò và quyền hạn
- **Departments** - Cấu trúc phòng ban
- **Job Families & Job Titles** - Phân loại công việc
- **Employees** - Dữ liệu nhân viên cốt lõi
- **Employment History** - Lịch sử thay đổi vị trí
- **Attendance** - Theo dõi chấm công
- **Leave Requests** - Yêu cầu và phê duyệt nghỉ phép
- **Leave Types & Balance** - Loại và số dư nghỉ phép
- **Work Shifts** - Mẫu ca làm việc
- **Work Schedules** - Lịch làm việc nhân viên
- **Salary Components** - Thành phần lương
- **Employee Salary** - Thông tin lương nhân viên
- **Activity Logs** - Nhật ký hoạt động hệ thống

## ⚙️ Cài Đặt

### Yêu Cầu

- **Node.js** 18+
- **PostgreSQL** 12+
- Hoặc sử dụng Replit (được cấp sẵn PostgreSQL)

### Các Bước Cài Đặt

1. **Clone repository** (nếu cần)
   ```bash
   git clone <repository-url>
   cd hrm-system
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường**
   Tạo file `.env.local` hoặc `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/hrm_db
   NODE_ENV=development
   PORT=5000
   ```

4. **Tạo cơ sở dữ liệu schema**
   ```bash
   npm run db:push
   ```

5. **Khởi động development server**
   ```bash
   npm run dev
   ```

   Ứng dụng sẽ chạy trên: **http://localhost:5000**

## 📜 Các Lệnh Có Sẵn

| Lệnh | Mô Tả |
|------|-------|
| `npm run dev` | Khởi động development server với hot reload |
| `npm run build` | Build cho production |
| `npm start` | Khởi động production server |
| `npm run db:push` | Đẩy schema thay đổi lên cơ sở dữ liệu |
| `npm run check` | Kiểm tra kiểu dữ liệu TypeScript |

## 🚀 Deployment

Dự án được cấu hình để deploy trên **Replit** hoặc các nền tảng hosting tương tự:

```bash
npm run build    # Build cho production
npm start        # Khởi động server production
```

Các biến môi trường cần thiết sẽ được thiết lập thông qua bảng Secrets trong Replit.

## 🎨 Thiết Kế & UI

- **Responsive Design**: Hỗ trợ desktop và mobile
- **Tailwind CSS**: Dễ tùy chỉnh và bảo trì
- **Radix UI Components**: Component không cần style
- **Material Design Principles**: Giao diện hiện đại và thân thiện

## 📊 Cấu Hình Frontend

Frontend được cấu hình sử dụng:
- **Vue 3 Composition API** cho logic component
- **Vue Router** cho điều hướng
- **Pinia** cho quản lý trạng thái toàn cục
- **Vite** cho build nhanh và hot reload

## 🔐 Bảo Mật

- Xác thực dựa trên session
- Mã hóa mật khẩu với bcryptjs
- Kiểm soát truy cập dựa trên vai trò (RBAC)
- PostgreSQL connection pooling
- Environment variables cho các giá trị nhạy cảm

## 🐛 Vấn Đề Đã Biết

- Các cảnh báo Vue nhỏ về thuộc tính `data-testid` (không ảnh hưởng chức năng)
- Cảnh báo kiểu dữ liệu Drizzle ORM nhỏ (không ảnh hưởng)

## 📝 Các Bước Tiếp Theo

- [ ] Kết nối các trang mới với API backend
- [ ] Triển khai lưu trữ dữ liệu cho tất cả biểu mẫu
- [ ] Thêm xác thực và xử lý lỗi
- [ ] Hoàn thành tính năng Employee Portal
- [ ] Tối ưu hóa hiệu suất

## 👨‍💻 Phát Triển

Dự án sử dụng 100% **JavaScript thuần** (không TypeScript) để:
- ✅ Triển khai đơn giản hơn
- ✅ Thời gian khởi động nhanh hơn
- ✅ Ít overhead hơn
- ✅ Tương thích tốt hơn với Replit

### Các File Đã Chuyển Sang JavaScript

- `server/index.js`
- `server/routes.js`
- `server/storage.js`
- `server/vite.js`
- `shared/schema.js`
- `vite.config.js`
- `drizzle.config.js`
- `tailwind.config.js`

## 📞 Hỗ Trợ

Nếu bạn gặp vấn đề:
1. Kiểm tra console browser (F12)
2. Kiểm tra console server (terminal)
3. Đảm bảo biến môi trường `DATABASE_URL` được đặt chính xác
4. Chạy `npm run db:push` để đồng bộ schema

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: November 23, 2025  
**License**: MIT
