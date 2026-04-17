<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Cổng Nhân viên</h1>
      <p class="text-muted-foreground mt-1">Xem thông tin cá nhân, yêu cầu nghỉ phép và chấm công</p>
    </div>

    <!-- Loading State -->
    <div v-if="pageLoading" class="text-center py-12">
      <p class="text-muted-foreground">Đang tải dữ liệu...</p>
    </div>

    <!-- No Employee Linked -->
    <div v-else-if="!currentEmployee.id" class="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
      <p class="text-destructive font-medium">Tài khoản này chưa được liên kết với hồ sơ nhân viên nào.</p>
      <p class="text-sm text-muted-foreground mt-1">Vui lòng liên hệ bộ phận nhân sự để được hỗ trợ.</p>
    </div>

    <template v-else>
      <!-- Personal Info Card -->
      <BaseCard>
        <div class="flex items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {{ getInitials(currentEmployee.full_name) }}
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ currentEmployee.full_name }}</h2>
            <p class="text-muted-foreground">Mã NV: {{ currentEmployee.employee_code || '-' }}</p>
            <p class="text-muted-foreground">{{ currentEmployee.job_title_name || '-' }} | {{ currentEmployee.department_name || '-' }}</p>
          </div>
        </div>
      </BaseCard>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-border overflow-x-auto">
        <button
          @click="activeTab = 'attendance'"
          :class="['px-4 py-2 font-medium whitespace-nowrap', activeTab === 'attendance' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground']"
        >
          Chấm công
        </button>
        <button
          @click="activeTab = 'leaves'"
          :class="['px-4 py-2 font-medium whitespace-nowrap', activeTab === 'leaves' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground']"
        >
          Yêu cầu nghỉ phép
        </button>
        <button
          @click="activeTab = 'salary'"
          :class="['px-4 py-2 font-medium whitespace-nowrap', activeTab === 'salary' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground']"
        >
          Lương
        </button>
        <button
          @click="activeTab = 'profile'"
          :class="['px-4 py-2 font-medium whitespace-nowrap', activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground']"
        >
          Thông tin cá nhân
        </button>
      </div>

      <!-- ===== ATTENDANCE TAB ===== -->
      <div v-if="activeTab === 'attendance'">
        <BaseCard>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-foreground">Tổng quan Điểm danh</h3>
            <BaseButton @click="handleCheckIn" :disabled="checkInLoading" class="shadow-sm">
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ checkInLoading ? 'Đang xử lý...' : 'Chấm công ngay' }}
            </BaseButton>
          </div>

          <div class="mb-8 p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/20">
            <h4 class="text-xl font-extrabold text-primary mb-2">Tiến độ tháng này</h4>
            <p class="text-sm text-muted-foreground mb-4">Bạn đã có mặt <strong class="text-foreground text-base">{{ attendanceStats.present }}</strong> ngày. Luôn giữ vững năng lượng nhé!</p>

            <div class="w-full bg-border h-4 rounded-full overflow-hidden shadow-inner">
              <div class="bg-primary h-full rounded-full transition-all duration-1000 origin-left" :style="{ width: Math.min((attendanceStats.present / workingDaysInMonth) * 100, 100) + '%' }"></div>
            </div>

            <div class="flex flex-wrap items-center gap-6 mt-5 text-sm font-semibold">
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-success shadow-sm"></span> Đúng giờ: {{ attendanceStats.present }}</div>
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-warning shadow-sm"></span> Đi muộn: {{ attendanceStats.late }}</div>
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-destructive shadow-sm"></span> Vắng mặt: {{ attendanceStats.absent }}</div>
            </div>
          </div>

          <!-- Month filter -->
          <div class="flex items-center gap-3 mb-4">
            <label class="text-sm font-medium text-foreground">Tháng:</label>
            <select v-model="attendanceMonth" @change="loadAttendanceData(currentEmployee.id)" class="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div class="space-y-4">
            <h3 class="font-semibold text-foreground">Lịch sử Chấm công</h3>
            <div v-if="attendanceRecords.length === 0" class="text-center py-8 text-muted-foreground">Chưa có dữ liệu chấm công tháng này</div>
            <BaseTable
              v-else
              :columns="[
                { key: 'attendance_date', label: 'Ngày làm việc' },
                { key: 'time_log', label: 'Vào - Ra' },
                { key: 'work_hours', label: 'Số giờ làm' },
                { key: 'status', label: 'Trạng thái' }
              ]"
              :data="attendanceRecords"
            >
              <template #cell-attendance_date="{ item }">
                <span>{{ formatDate(item.attendance_date) }}</span>
              </template>

              <template #cell-time_log="{ item }">
                <div class="flex items-center gap-2 font-medium">
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{{ formatTime(item.check_in_time) }}</span>
                  <span class="text-muted-foreground">→</span>
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{{ item.check_out_time ? formatTime(item.check_out_time) : '--:--' }}</span>
                </div>
              </template>

              <template #cell-work_hours="{ item }">
                <span class="font-bold text-primary">{{ item.total_work_hours ? item.total_work_hours + 'h' : '-' }}</span>
              </template>

              <template #cell-status="{ item }">
                <BaseBadge :variant="item.status === 'present' ? 'success' : (item.status === 'late' ? 'warning' : 'destructive')">
                  {{ item.status === 'present' ? 'Có mặt' : (item.status === 'late' ? 'Muộn' : 'Vắng') }}
                </BaseBadge>
              </template>
            </BaseTable>
          </div>
        </BaseCard>
      </div>

      <!-- ===== LEAVES TAB ===== -->
      <div v-if="activeTab === 'leaves'">
        <BaseCard>
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Số ngày nghỉ phép còn lại</h3>
            <div v-if="leaveBalances.length === 0" class="text-sm text-muted-foreground">Chưa có thông tin số dư nghỉ phép.</div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="balance in leaveBalances" :key="balance.id" class="p-4 border rounded-lg">
                <p class="font-medium text-sm">{{ balance.leave_type || balance.leave_type_name || 'Loại nghỉ' }}</p>
                <p class="text-2xl font-bold text-primary">{{ balance.remaining ?? balance.total_entitled ?? 0 }}</p>
                <p class="text-sm text-muted-foreground">ngày còn lại / {{ balance.total_entitled ?? 0 }} ngày</p>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Yêu cầu gần đây</h3>
              <BaseButton @click="showLeaveModal = true">+ Tạo yêu cầu</BaseButton>
            </div>
            <div v-if="leaveRequests.length === 0" class="text-center py-8 text-muted-foreground">Chưa có yêu cầu nghỉ phép nào</div>
            <BaseTable
              v-else
              :columns="[
                { key: 'leave_type', label: 'Loại nghỉ' },
                { key: 'dates', label: 'Thời gian' },
                { key: 'reason', label: 'Lý do' },
                { key: 'status', label: 'Trạng thái' }
              ]"
              :data="leaveRequests.slice(0, 10)"
            >
              <template #cell-leave_type="{ item }">
                <span>{{ item.leave_type || item.leave_type_name || `Loại #${item.leave_type_id}` }}</span>
              </template>
              <template #cell-dates="{ item }">
                <div class="text-sm">
                  <p>{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</p>
                  <p class="text-xs text-muted-foreground">{{ item.total_days || item.days_count || 0 }} ngày</p>
                </div>
              </template>
              <template #cell-reason="{ item }">
                <span class="text-sm text-muted-foreground">{{ item.reason || '-' }}</span>
              </template>
              <template #cell-status="{ item }">
                <BaseBadge :variant="item.status === 'approved' ? 'success' : (item.status === 'pending' ? 'warning' : 'destructive')">
                  {{ item.status === 'approved' ? 'Đã duyệt' : (item.status === 'pending' ? 'Chờ duyệt' : 'Từ chối') }}
                </BaseBadge>
              </template>
            </BaseTable>
          </div>
        </BaseCard>
      </div>

      <!-- ===== SALARY TAB ===== -->
      <div v-if="activeTab === 'salary'">
        <BaseCard>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Thông tin lương</h3>
              <div class="flex gap-2" v-if="salaryDetails.length > 0">
                <button
                  @click="exportSalaryExcel"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                  title="Xuất file Excel (.xlsx)"
                >
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
                <button
                  @click="exportSalaryPDF"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                  title="Xuất file PDF"
                >
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
              </div>
            </div>

            <!-- Summary cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-4 border rounded-lg">
                <p class="text-sm text-muted-foreground">Lương cơ bản</p>
                <p class="text-2xl font-bold">{{ formatCurrency(salaryTotals.basic) }}</p>
              </div>
              <div class="p-4 border rounded-lg">
                <p class="text-sm text-muted-foreground">Phụ cấp</p>
                <p class="text-2xl font-bold">{{ formatCurrency(salaryTotals.allowances) }}</p>
              </div>
              <div class="p-4 border rounded-lg">
                <p class="text-sm text-muted-foreground">Khấu trừ</p>
                <p class="text-2xl font-bold text-destructive">- {{ formatCurrency(salaryTotals.deductions) }}</p>
              </div>
              <div class="p-4 border rounded-lg bg-primary/5 border-primary/20">
                <p class="text-sm text-muted-foreground">Lương ròng</p>
                <p class="text-2xl font-bold text-primary">{{ formatCurrency(salaryTotals.net) }}</p>
              </div>
            </div>

            <!-- Detail table -->
            <div v-if="salaryDetails.length > 0">
              <h4 class="font-medium text-sm text-muted-foreground mb-3 mt-4">Chi tiết từng thành phần</h4>
              <div class="rounded-lg border overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-muted/50">
                    <tr>
                      <th class="text-left px-4 py-3 font-medium">Thành phần</th>
                      <th class="text-left px-4 py-3 font-medium">Loại</th>
                      <th class="text-right px-4 py-3 font-medium">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in salaryDetails" :key="item.id" class="border-t border-border">
                      <td class="px-4 py-3">{{ item.component_name || item.salary_component_name || '-' }}</td>
                      <td class="px-4 py-3">
                        <BaseBadge :variant="item.type === 'deduction' ? 'destructive' : 'success'">
                          {{ item.type === 'deduction' ? 'Khấu trừ' : 'Khoản thu' }}
                        </BaseBadge>
                      </td>
                      <td class="px-4 py-3 text-right font-medium" :class="item.type === 'deduction' ? 'text-destructive' : ''">
                        {{ item.type === 'deduction' ? '-' : '' }}{{ formatCurrency(item.amount) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-center py-8 text-muted-foreground">Chưa có dữ liệu lương</div>
          </div>
        </BaseCard>
      </div>

      <!-- ===== PROFILE TAB ===== -->
      <div v-if="activeTab === 'profile'">
        <BaseCard>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold">Thông tin cá nhân</h3>
            <BaseButton v-if="!editingProfile" @click="startEditProfile" variant="outline">
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </BaseButton>
          </div>

          <div v-if="!editingProfile" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-muted-foreground">Mã nhân viên</p>
              <p class="font-medium mt-1">{{ currentEmployee.employee_code || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Họ tên</p>
              <p class="font-medium mt-1">{{ currentEmployee.full_name || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Email</p>
              <p class="font-medium mt-1">{{ currentEmployee.email || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Số điện thoại</p>
              <p class="font-medium mt-1">{{ currentEmployee.phone || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ngày sinh</p>
              <p class="font-medium mt-1">{{ formatDate(currentEmployee.date_of_birth) || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Giới tính</p>
              <p class="font-medium mt-1">{{ currentEmployee.gender === 'male' ? 'Nam' : currentEmployee.gender === 'female' ? 'Nữ' : '-' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-sm text-muted-foreground">Địa chỉ</p>
              <p class="font-medium mt-1">{{ currentEmployee.address || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Phòng ban</p>
              <p class="font-medium mt-1">{{ currentEmployee.department_name || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Chức vụ</p>
              <p class="font-medium mt-1">{{ currentEmployee.job_title_name || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ngày vào làm</p>
              <p class="font-medium mt-1">{{ formatDate(currentEmployee.hire_date) || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Trạng thái</p>
              <BaseBadge :variant="currentEmployee.is_active ? 'success' : 'destructive'">
                {{ currentEmployee.is_active ? 'Đang làm việc' : 'Đã nghỉ' }}
              </BaseBadge>
            </div>
          </div>

          <!-- Edit form -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">Số điện thoại</label>
                <input v-model="profileForm.phone" type="tel" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div class="md:col-span-2 md:max-w-lg">
                <label class="block text-sm font-medium text-foreground mb-1">Địa chỉ</label>
                <input v-model="profileForm.address" type="text" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div v-if="profileError" class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p class="text-destructive text-sm">{{ profileError }}</p>
            </div>
            <div class="flex gap-3">
              <BaseButton @click="saveProfile" :disabled="savingProfile">
                {{ savingProfile ? 'Đang lưu...' : 'Lưu thay đổi' }}
              </BaseButton>
              <BaseButton variant="outline" @click="editingProfile = false">Hủy</BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </template>

    <!-- ===== LEAVE REQUEST MODAL ===== -->
    <BaseModal v-model="showLeaveModal" title="Tạo đơn xin nghỉ">
      <div class="space-y-4">
        <div class="p-3 bg-muted rounded-lg">
          <p class="text-sm text-muted-foreground">Nhân viên</p>
          <p class="font-medium">{{ currentEmployee.full_name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Loại nghỉ <span class="text-destructive">*</span></label>
          <select v-model="leaveForm.leave_type_id" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">-- Chọn loại nghỉ --</option>
            <option v-for="lt in leaveTypes" :key="lt.id" :value="lt.id">{{ lt.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Từ ngày <span class="text-destructive">*</span></label>
            <input v-model="leaveForm.start_date" type="date" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Đến ngày <span class="text-destructive">*</span></label>
            <input v-model="leaveForm.end_date" type="date" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Lý do</label>
          <textarea v-model="leaveForm.reason" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows="3" placeholder="Nhập lý do xin nghỉ..."></textarea>
        </div>
        <div v-if="leaveFormError" class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p class="text-destructive text-sm">{{ leaveFormError }}</p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showLeaveModal = false" :disabled="leaveFormLoading">Hủy</BaseButton>
        <BaseButton @click="submitLeaveRequest" :disabled="leaveFormLoading">
          {{ leaveFormLoading ? 'Đang tạo...' : 'Tạo đơn' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseModal from '../components/BaseModal.vue';
import axiosClient from '../services/axiosClient';
import { useNotificationStore } from '../stores/notificationStore';
import * as XLSX from 'xlsx';

const notificationStore = useNotificationStore();
const activeTab = ref('attendance');
const showLeaveModal = ref(false);
const pageLoading = ref(true);

// ── Employee state ──
const currentEmployee = ref({
  id: null,
  employee_code: '',
  full_name: '',
  email: '',
  phone: '',
  date_of_birth: null,
  gender: '',
  address: '',
  department_name: '',
  job_title_name: '',
  hire_date: null,
  is_active: true,
});

// ── Attendance state ──
const attendanceStats = ref({ present: 0, absent: 0, late: 0 });
const attendanceRecords = ref([]);
const checkInLoading = ref(false);

// ── Leave state ──
const leaveBalances = ref([]);
const leaveRequests = ref([]);
const leaveTypes = ref([]);
const leaveForm = ref({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
const leaveFormError = ref('');
const leaveFormLoading = ref(false);

// ── Salary state ──
const salaryDetails = ref([]);
const salaryTotals = computed(() => {
  let basic = 0, allowances = 0, deductions = 0;
  salaryDetails.value.forEach(item => {
    const amt = Number(item.amount) || 0;
    if (item.type === 'deduction') {
      deductions += amt;
    } else {
      // Distinguish basic from other earnings by component name
      const name = (item.component_name || '').toLowerCase();
      if (name.includes('cơ bản') || name.includes('co ban') || name.includes('basic')) {
        basic += amt;
      } else {
        allowances += amt;
      }
    }
  });
  return { basic, allowances, deductions, net: basic + allowances - deductions };
});

// ── Profile edit state ──
const editingProfile = ref(false);
const savingProfile = ref(false);
const profileError = ref('');
const profileForm = ref({ phone: '', address: '' });

// ── Month filter for attendance ──
const today = new Date();
const attendanceMonth = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
const monthOptions = computed(() => {
  const opts = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push({ value: val, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` });
  }
  return opts;
});

const workingDaysInMonth = computed(() => {
  const [year, month] = attendanceMonth.value.split('-').map(Number);
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
});

// ── Helpers ──
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatTime = (dt) => {
  if (!dt) return '--:--';
  return new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// ── Data loaders ──
const loadEmployeeInfo = async (userId) => {
  try {
    const response = await axiosClient.get('/employees');
    const employees = response.data?.data || response.data || [];
    const me = employees.find(emp => String(emp.user_id) === String(userId));
    if (me) {
      currentEmployee.value = me;
      return me.id;
    } else {
      notificationStore.addError('Tài khoản này chưa được liên kết với hồ sơ nhân viên nào!');
    }
  } catch (error) {
    console.error('Error loading employee info:', error);
  }
  return null;
};

const loadAttendanceData = async (empId) => {
  try {
    const [year, month] = attendanceMonth.value.split('-').map(Number);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const response = await axiosClient.get('/attendance', {
      params: { employee_id: empId, from, to }
    });
    const records = response.data?.data || response.data || [];
    attendanceRecords.value = records;

    const stats = { present: 0, absent: 0, late: 0 };
    records.forEach(record => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'late') stats.late++;
    });
    attendanceStats.value = stats;
  } catch (error) {
    console.error('Error loading attendance data:', error);
  }
};

const loadLeaveData = async (empId) => {
  try {
    const [balancesRes, requestsRes, typesRes] = await Promise.all([
      axiosClient.get(`/employees/${empId}/leave-balances`).catch(() => ({ data: [] })),
      axiosClient.get('/leave-requests', { params: { employee_id: empId } }).catch(() => ({ data: [] })),
      axiosClient.get('/leave-types').catch(() => ({ data: [] })),
    ]);
    leaveBalances.value = balancesRes.data?.data || balancesRes.data || [];
    leaveRequests.value = requestsRes.data?.data || requestsRes.data || [];
    leaveTypes.value = typesRes.data?.data || typesRes.data || [];
  } catch (error) {
    console.error('Error loading leave data:', error);
  }
};

const loadSalaryData = async (empId) => {
  try {
    const response = await axiosClient.get(`/employees/${empId}/salaries`);
    salaryDetails.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error loading salary data:', error);
  }
};

// ── Actions ──
const handleCheckIn = async () => {
  if (!currentEmployee.value.id) return;
  checkInLoading.value = true;
  try {
    await axiosClient.post('/attendance/check-in', { employee_id: currentEmployee.value.id });
    notificationStore.addSuccess('Chấm công thành công!');
    await loadAttendanceData(currentEmployee.value.id);
  } catch (error) {
    const msg = error.response?.data?.error || 'Lỗi chấm công';
    if (msg.includes('Already checked in')) {
      notificationStore.addError('Bạn đã chấm công hôm nay rồi!');
    } else {
      notificationStore.addError(msg);
    }
  } finally {
    checkInLoading.value = false;
  }
};

const submitLeaveRequest = async () => {
  leaveFormError.value = '';
  if (!leaveForm.value.leave_type_id) { leaveFormError.value = 'Vui lòng chọn loại nghỉ'; return; }
  if (!leaveForm.value.start_date || !leaveForm.value.end_date) { leaveFormError.value = 'Vui lòng chọn ngày bắt đầu và kết thúc'; return; }
  if (leaveForm.value.end_date < leaveForm.value.start_date) { leaveFormError.value = 'Ngày kết thúc phải sau ngày bắt đầu'; return; }

  leaveFormLoading.value = true;
  try {
    const start = new Date(leaveForm.value.start_date);
    const end = new Date(leaveForm.value.end_date);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    await axiosClient.post('/leave-requests', {
      employee_id: currentEmployee.value.id,
      leave_type_id: parseInt(leaveForm.value.leave_type_id),
      start_date: leaveForm.value.start_date,
      end_date: leaveForm.value.end_date,
      total_days: diffDays,
      days_count: diffDays,
      reason: leaveForm.value.reason,
      status: 'pending',
    });

    notificationStore.addSuccess('Tạo đơn xin nghỉ thành công!');
    showLeaveModal.value = false;
    leaveForm.value = { leave_type_id: '', start_date: '', end_date: '', reason: '' };
    await loadLeaveData(currentEmployee.value.id);
  } catch (error) {
    leaveFormError.value = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
  } finally {
    leaveFormLoading.value = false;
  }
};

const startEditProfile = () => {
  profileForm.value = {
    phone: currentEmployee.value.phone || '',
    address: currentEmployee.value.address || '',
  };
  profileError.value = '';
  editingProfile.value = true;
};

const saveProfile = async () => {
  savingProfile.value = true;
  profileError.value = '';
  try {
    const response = await axiosClient.patch(`/employees/${currentEmployee.value.id}`, {
      phone: profileForm.value.phone,
      address: profileForm.value.address,
    });
    currentEmployee.value = { ...currentEmployee.value, ...response.data };
    notificationStore.addSuccess('Cập nhật thông tin thành công!');
    editingProfile.value = false;
  } catch (error) {
    profileError.value = error.response?.data?.error || 'Không thể cập nhật, vui lòng thử lại';
  } finally {
    savingProfile.value = false;
  }
};

// ── Export Salary ──
const sanitizeFilename = (str) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s.-]/g, '_').trim();

const exportSalaryExcel = () => {
  try {
    const emp = currentEmployee.value;
    const totals = salaryTotals.value;

    const data = [
      ['PHIẾU LƯƠNG NHÂN VIÊN'],
      [],
      ['Họ tên', emp.full_name || '-'],
      ['Mã nhân viên', emp.employee_code || '-'],
      ['Phòng ban', emp.department_name || '-'],
      ['Chức vụ', emp.job_title_name || '-'],
      ['Ngày xuất', new Date().toLocaleDateString('vi-VN')],
      [],
      ['THÀNH PHẦN LƯƠNG', 'LOẠI', 'SỐ TIỀN (VNĐ)'],
      ...salaryDetails.value.map(item => [
        item.component_name || item.salary_component_name || '-',
        item.type === 'deduction' ? 'Khấu trừ' : 'Khoản thu',
        item.type === 'deduction' ? -Number(item.amount || 0) : Number(item.amount || 0),
      ]),
      [],
      ['Lương cơ bản', '', totals.basic],
      ['Phụ cấp', '', totals.allowances],
      ['Khấu trừ', '', -totals.deductions],
      ['LƯƠNG THỰC LĨNH', '', totals.net],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PhieuLuong");

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `PhieuLuong_${sanitizeFilename(emp.full_name || 'NhanVien')}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    notificationStore.addSuccess('Tải xuống file Excel thành công!');
  } catch (err) {
    console.error('Excel export error:', err);
    notificationStore.addError('Khong the xuat file: ' + (err.message || 'Unknown error'));
  }
};


const exportSalaryPDF = () => {
  const emp = currentEmployee.value;
  const totals = salaryTotals.value;
  const exportDate = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const rows = salaryDetails.value.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.component_name || item.salary_component_name || '-'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
        <span style="padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${item.type === 'deduction' ? '#fee2e2' : '#dcfce7'};color:${item.type === 'deduction' ? '#dc2626' : '#16a34a'}">
          ${item.type === 'deduction' ? 'Khấu trừ' : 'Khoản thu'}
        </span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:${item.type === 'deduction' ? '#dc2626' : '#111827'}">
        ${item.type === 'deduction' ? '-' : ''}${Number(item.amount).toLocaleString('vi-VN')} ₫
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phiếu lương - ${emp.full_name || 'Nhân viên'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; }
    .page { max-width: 700px; margin: 0 auto; padding: 40px 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
    .company { font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
    .title-block { text-align: right; }
    .title { font-size: 20px; font-weight: 700; color: #111827; }
    .subtitle { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px; margin-bottom: 28px; padding: 20px; background: #f9fafb; border-radius: 10px; }
    .info-item label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 14px; font-weight: 600; color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
    thead th:last-child { text-align: right; }
    .summary { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #374151; }
    .summary-row.net { border-top: 1px solid #93c5fd; margin-top: 10px; padding-top: 10px; font-size: 16px; font-weight: 800; color: #1d4ed8; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #9ca3af; }
    @media print { .page { padding: 20px; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="company">CODEDENNGU</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">Hệ thống Quản lý Nhân sự</div>
      </div>
      <div class="title-block">
        <div class="title">PHIẾU LƯƠNG</div>
        <div class="subtitle">Ngày xuất: ${exportDate}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item"><label>Họ và tên</label><span>${emp.full_name || '-'}</span></div>
      <div class="info-item"><label>Mã nhân viên</label><span>${emp.employee_code || '-'}</span></div>
      <div class="info-item"><label>Phòng ban</label><span>${emp.department_name || '-'}</span></div>
      <div class="info-item"><label>Chức vụ</label><span>${emp.job_title_name || '-'}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Thành phần lương</th>
          <th>Loại</th>
          <th style="text-align:right">Số tiền</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="summary">
      <div class="summary-row"><span>Lương cơ bản</span><span>${totals.basic.toLocaleString('vi-VN')} ₫</span></div>
      <div class="summary-row"><span>Phụ cấp</span><span>${totals.allowances.toLocaleString('vi-VN')} ₫</span></div>
      <div class="summary-row"><span>Khấu trừ</span><span style="color:#dc2626">- ${totals.deductions.toLocaleString('vi-VN')} ₫</span></div>
      <div class="summary-row net"><span>Lương thực nhận</span><span>${totals.net.toLocaleString('vi-VN')} ₫</span></div>
    </div>

    <div class="footer">
      <p>Phiếu lương được tạo tự động bởi hệ thống HRM — ${exportDate}</p>
    </div>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;
  // Blob URL preserves UTF-8 — full Vietnamese diacritics
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank', 'width=800,height=900');
  if (printWindow) printWindow.addEventListener('unload', () => URL.revokeObjectURL(blobUrl));
};

// ── Init ──
onMounted(async () => {
  pageLoading.value = true;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) {
    const empId = await loadEmployeeInfo(user.id);
    if (empId) {
      await Promise.all([
        loadAttendanceData(empId),
        loadLeaveData(empId),
        loadSalaryData(empId),
      ]);
    }
  }
  pageLoading.value = false;
});
</script>