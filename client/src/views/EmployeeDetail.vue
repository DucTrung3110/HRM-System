<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">Đang tải thông tin nhân viên...</p>
    </div>

    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Lỗi:</p>
      <p class="text-destructive/80 text-sm mt-1">{{ error }}</p>
    </div>

    <template v-else>
      <div class="flex items-center gap-4">
        <button
          @click="$router.push('/employees')"
          class="p-2 rounded-lg hover:bg-muted"
          data-testid="button-back"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-foreground">{{ employee?.full_name }}</h1>
          <p class="text-muted-foreground mt-1">{{ employee?.code || employee?.employee_code }}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BaseCard title="Thông tin cá nhân">
          <div class="space-y-4">
            <div class="flex justify-center">
              <div class="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
                {{ getInitials(employee?.full_name || '') }}
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <p class="text-sm text-muted-foreground">Email</p>
                <p class="font-medium">{{ employee?.personal_email || employee?.email || 'Chưa có' }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Điện thoại</p>
                <p class="font-medium">{{ employee?.personal_phone || employee?.phone || 'Chưa có' }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Ngày sinh</p>
                <p class="font-medium">{{ formatDate(employee?.dob || employee?.date_of_birth) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Giới tính</p>
                <p class="font-medium">{{ getGender(employee?.gender) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Địa chỉ</p>
                <p class="font-medium">{{ employee?.address || 'Chưa có' }}</p>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard title="Thông tin công việc" class="lg:col-span-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Phòng ban</p>
              <p class="font-medium">{{ employee?.department || employee?.department_name || 'Chưa phân công' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Chức danh</p>
              <p class="font-medium">{{ employee?.job_title || employee?.job_title_name || 'Chưa phân công' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Loại hợp đồng</p>
              <p class="font-medium">{{ getContractType(employee?.contract_type) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Trạng thái làm việc</p>
              <BaseBadge :variant="getStatusVariant(employee?.employment_status)">
                {{ getStatusText(employee?.employment_status) }}
              </BaseBadge>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ngày vào làm</p>
              <p class="font-medium">{{ formatDate(employee?.start_date || employee?.hire_date) }}</p>
            </div>
          </div>

          <div class="border-t border-border mt-6 pt-6" v-if="employee?.employment_status === 'inactive' || employee?.employment_status === 'resigned' || employee?.employment_status === 'terminated'">
            <h4 class="font-semibold text-destructive mb-3">Thông tin nghỉ việc</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-muted-foreground">Ngày nghỉ việc</p>
                <p class="font-medium">{{ formatDate(employee?.end_date) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Lý do</p>
                <p class="font-medium">{{ employee?.termination_reason || 'Không ghi nhận' }}</p>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <BaseCard>
        <div class="border-b border-border mb-6">
          <div class="flex gap-4">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['px-4 py-2 border-b-2 transition-colors',
                       activeTab === tab.id 
                         ? 'border-primary text-primary font-medium' 
                         : 'border-transparent text-muted-foreground hover:text-foreground']"
              :data-testid="`tab-${tab.id}`"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <div v-if="activeTab === 'personal'">
          <h4 class="font-semibold mb-4">Giấy tờ tùy thân</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">CMND/CCCD</p>
              <p class="font-medium">{{ employee?.id_number || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ngày cấp</p>
              <p class="font-medium">{{ formatDate(employee?.id_issue_date) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Nơi cấp</p>
              <p class="font-medium">{{ employee?.id_issue_place || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Mã số thuế cá nhân</p>
              <p class="font-medium">{{ employee?.tax_number || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Số sổ BHXH</p>
              <p class="font-medium">{{ employee?.insurance_number || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Số tài khoản ngân hàng</p>
              <p class="font-medium">{{ employee?.bank_account || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ngân hàng</p>
              <p class="font-medium">{{ employee?.bank_name || 'Chưa có' }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'emergency'">
          <h4 class="font-semibold mb-4">Thông tin liên hệ khẩn cấp</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Họ tên người liên hệ</p>
              <p class="font-medium">{{ employee?.emergency_contact_name || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Mối quan hệ</p>
              <p class="font-medium">{{ employee?.relationship || employee?.emergency_contact_relationship || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Số điện thoại</p>
              <p class="font-medium">{{ employee?.emergency_contact_phone || 'Chưa có' }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'history'">
          <h4 class="font-semibold mb-4">Lịch sử công tác</h4>
          <div v-if="employmentHistory.length === 0" class="text-center py-8 text-muted-foreground">
            Chưa có lịch sử công tác
          </div>
          <div v-else class="space-y-3">
            <div v-for="history in employmentHistory" :key="history.id" class="border border-border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">{{ history.job_title || 'Chưa có chức danh' }}</p>
                  <p class="text-sm text-muted-foreground">{{ history.department || 'Chưa có phòng ban' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <BaseBadge size="sm" :variant="getHistoryStatusVariant(history.employment_status)">
                    {{ getHistoryStatusLabel(history.employment_status) }}
                  </BaseBadge>
                  <BaseBadge size="sm" variant="outline">
                    {{ formatDate(history.start_date) }} - {{ history.end_date ? formatDate(history.end_date) : 'Hiện tại' }}
                  </BaseBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'salary'">
          <h4 class="font-semibold mb-4">Thông tin lương</h4>
          <div v-if="salaryInfo.length === 0" class="text-center py-8 text-muted-foreground">
            Chưa có thông tin lương
          </div>
          <div v-else class="space-y-3">
            <div v-for="salary in salaryInfo" :key="salary.id" class="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p class="font-medium">{{ salary.component_name }}</p>
                <p class="text-sm text-muted-foreground">{{ salary.type === 'earning' ? 'Thu nhập' : 'Khấu trừ' }}</p>
              </div>
              <p class="font-semibold" :class="salary.type === 'earning' ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salary.amount) }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseCard from '../components/BaseCard.vue';
import BaseBadge from '../components/BaseBadge.vue';
import { employeeService } from '../services/employeeService';

const route = useRoute();

const employee = ref(null);
const employmentHistory = ref([]);
const salaryInfo = ref([]);
const loading = ref(true);
const error = ref('');
const activeTab = ref('personal');

const tabs = [
  { id: 'personal', label: 'Giấy tờ tùy thân' },
  { id: 'emergency', label: 'Liên hệ khẩn cấp' },
  { id: 'history', label: 'Lịch sử công tác' },
  { id: 'salary', label: 'Thông tin lương' },
];

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return 'Chưa có';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getGender = (gender) => {
  const genders = {
    M: 'Nam',
    F: 'Nữ',
    male: 'Nam',
    female: 'Nữ',
    O: 'Khác',
    other: 'Khác'
  };
  return genders[gender || ''] || 'Chưa có';
};

const getEmploymentType = (type) => {
  const types = {
    fulltime: 'Toàn thời gian',
    full_time: 'Toàn thời gian',
    parttime: 'Bán thời gian',
    part_time: 'Bán thời gian',
    contract: 'Hợp đồng',
    intern: 'Thực tập'
  };
  return types[type || ''] || 'Chưa có';
};

const getWorkLocation = (location) => {
  const locations = {
    head_office: 'Văn phòng chính',
    branch_1: 'Chi nhánh 1',
    branch_2: 'Chi nhánh 2',
    remote: 'Làm việc từ xa'
  };
  return locations[location || ''] || location || 'Chưa có';
};

const getStatusVariant = (status) => {
  const variants = {
    active: 'success',
    probation: 'warning',
    suspended: 'error',
    inactive: 'default',
    resigned: 'default',
    terminated: 'default'
  };
  return variants[status || 'inactive'] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    active: 'Đang làm việc',
    probation: 'Thử việc',
    suspended: 'Tạm ngưng',
    inactive: 'Nghỉ việc',
    resigned: 'Đã nghỉ',
    terminated: 'Chấm dứt HĐ'
  };
  return texts[status || 'inactive'] || 'Không xác định';
};

const getContractType = (type) => {
  const types = {
    permanent: 'Không xác định thời hạn',
    fixed_term: 'Xác định thời hạn',
    seasonal: 'Thời vụ',
    probation: 'Thử việc',
    freelance: 'Tự do'
  };
  return types[type || ''] || type || 'Chưa có';
};

const getHistoryStatusLabel = (status) => {
  const labels = {
    active: 'Chính thức',
    probation: 'Thử việc',
    promoted: 'Thăng chức',
    demoted: 'Giáng chức',
    transferred: 'Điều chuyển',
    suspended: 'Tạm ngưng',
    inactive: 'Nghỉ việc',
    resigned: 'Đã nghỉ',
    terminated: 'Chấm dứt HĐ'
  };
  return labels[status || ''] || status || 'Không xác định';
};

const getHistoryStatusVariant = (status) => {
  const variants = {
    active: 'success',
    probation: 'warning',
    promoted: 'success',
    demoted: 'error',
    transferred: 'default',
    suspended: 'error',
    inactive: 'default',
    resigned: 'default',
    terminated: 'default'
  };
  return variants[status || ''] || 'default';
};

onMounted(async () => {
  const employeeId = route.params.id;
  try {
    loading.value = true;
    error.value = '';
    
    const response = await employeeService.getById(employeeId);
    employee.value = response?.data || response;
    
    try {
      const historyRes = await employeeService.getHistories(employeeId);
      employmentHistory.value = historyRes?.data || historyRes || [];
    } catch (e) {
      console.log('Could not load employment history');
    }
    
    try {
      const salaryRes = await employeeService.getSalaries(employeeId);
      salaryInfo.value = salaryRes?.data || salaryRes || [];
    } catch (e) {
      console.log('Could not load salary info');
    }
    
  } catch (err) {
    console.error('Employee API Error:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể tải thông tin nhân viên';
  } finally {
    loading.value = false;
  }
});
</script>
