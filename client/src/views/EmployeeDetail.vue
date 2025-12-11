<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="$router.push('/employees')"
          class="p-2 rounded-lg hover-elevate"
          data-testid="button-back"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-foreground">{{ employee?.full_name }}</h1>
          <p class="text-muted-foreground mt-1">{{ employee?.code }}</p>
        </div>
      </div>
      <BaseButton
        variant="outline"
        @click="editMode = !editMode"
        data-testid="button-edit"
      >
        {{ editMode ? 'Hủy' : 'Chỉnh sửa' }}
      </BaseButton>
    </div>
    
    <!-- Employee Profile -->
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
              <p class="font-medium">{{ employee?.personal_email || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Điện thoại</p>
              <p class="font-medium">{{ employee?.personal_phone || 'Chưa có' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Ngày sinh</p>
              <p class="font-medium">{{ formatDate(employee?.dob) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Giới tính</p>
              <p class="font-medium">{{ getGender(employee?.gender) }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard title="Thông tin công việc" class="lg:col-span-2">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Phòng ban</p>
            <p class="font-medium">{{ employee?.department || 'Chưa có' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Chức danh</p>
            <p class="font-medium">{{ employee?.job_title || 'Chưa có' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Loại hợp đồng</p>
            <p class="font-medium">{{ getEmploymentType(employee?.employment_type) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Trạng thái</p>
            <BaseBadge :variant="getStatusVariant(employee?.employment_status)">
              {{ getStatusText(employee?.employment_status) }}
            </BaseBadge>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Ngày vào làm</p>
            <p class="font-medium">{{ formatDate(employee?.start_date) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Vị trí làm việc</p>
            <p class="font-medium">{{ getWorkLocation(employee?.work_location) }}</p>
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- Additional Info Tabs -->
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
            <p class="text-sm text-muted-foreground">Mã số thuế</p>
            <p class="font-medium">{{ employee?.tax_number || 'Chưa có' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Số bảo hiểm</p>
            <p class="font-medium">{{ employee?.insurance_number || 'Chưa có' }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-sm text-muted-foreground">Địa chỉ</p>
            <p class="font-medium">{{ employee?.address || 'Chưa có' }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="activeTab === 'emergency'">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Người liên hệ khẩn cấp</p>
            <p class="font-medium">{{ employee?.emergency_contact_name || 'Chưa có' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Số điện thoại</p>
            <p class="font-medium">{{ employee?.emergency_contact_phone || 'Chưa có' }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="activeTab === 'attendance'">
        <p class="text-center py-8 text-muted-foreground">Lịch sử chấm công sẽ được hiển thị ở đây</p>
      </div>
      
      <div v-if="activeTab === 'leave'">
        <p class="text-center py-8 text-muted-foreground">Lịch sử nghỉ phép sẽ được hiển thị ở đây</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseBadge from '../components/BaseBadge.vue';
import { employeeService } from '../services/employeeService';

const route = useRoute();
const router = useRouter();

const employee = ref(null);
const loading = ref(true);
const error = ref('');
const editMode = ref(false);
const activeTab = ref('personal');

const tabs = [
  { id: 'personal', label: 'Thông tin cá nhân' },
  { id: 'emergency', label: 'Liên hệ khẩn cấp' },
  { id: 'attendance', label: 'Chấm công' },
  { id: 'leave', label: 'Nghỉ phép' },
];

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return 'Chưa có';
  return new Date(date).toLocaleDateString('vi-VN');
};

const getGender = (gender) => {
  const genders = {
    M: 'Nam',
    F: 'Nữ',
    O: 'Khác'
  };
  return genders[gender || ''] || 'Chưa có';
};

const getEmploymentType = (type) => {
  const types = {
    full_time: 'Toàn thời gian',
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
    remote: 'Từ xa'
  };
  return locations[location || ''] || 'Chưa có';
};

const getStatusVariant = (status) => {
  const variants = {
    active: 'success',
    probation: 'warning',
    suspended: 'error',
    inactive: 'default'
  };
  return variants[status || 'inactive'] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    active: 'Đang làm việc',
    probation: 'Thử việc',
    suspended: 'Tạm ngưng',
    inactive: 'Nghỉ việc'
  };
  return texts[status || 'inactive'] || 'Không xác định';
};

onMounted(async () => {
  const employeeId = route.params.id;
  try {
    loading.value = true;
    error.value = '';
    const response = await employeeService.getById(employeeId);
    employee.value = response?.data || response;
  } catch (err) {
    console.error('Employee API Error:', err);
    error.value = err.response?.data?.error || err.message || 'Không thể tải thông tin nhân viên';
  } finally {
    loading.value = false;
  }
});
</script>
