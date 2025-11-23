<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Quản lý Nghỉ phép</h1>
      <BaseButton
        @click="showCreateModal = true"
        data-testid="button-create-leave"
        class="w-full sm:w-auto"
      >
        + Tạo đơn xin nghỉ
      </BaseButton>
    </div>

    <!-- Leave Balance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <BaseCard v-for="balance in balances" :key="balance.id">
        <div>
          <p class="text-sm text-muted-foreground">{{ balance.leave_type?.name }}</p>
          <div class="flex items-baseline gap-2 mt-2">
            <p class="text-3xl font-bold text-foreground">{{ balance.remaining }}</p>
            <p class="text-sm text-muted-foreground">/ {{ balance.total_entitled }} ngày</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Filters -->
    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BaseSelect
          v-model="filters.status"
          label="Trạng thái"
          :options="statusOptions"
          data-testid="select-status"
        />
        <BaseSelect
          v-model="filters.leaveType"
          label="Loại nghỉ"
          :options="leaveTypeOptions"
          data-testid="select-leave-type"
        />
        <BaseInput
          v-model="filters.startDate"
          type="date"
          label="Từ ngày"
          data-testid="input-start-date"
        />
        <div class="flex items-end">
          <BaseButton
            variant="outline"
            @click="applyFilters"
            data-testid="button-apply-filters"
          >
            Áp dụng
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Leave Requests Table -->
    <BaseCard title="Danh sách yêu cầu">
      <BaseTable
        :columns="columns"
        :data="requests"
        data-testid="table-leaves"
      >
        <template #cell-employee="{ item }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {{ getInitials(item.employee?.full_name || '') }}
            </div>
            <span class="font-medium">{{ item.employee?.full_name }}</span>
          </div>
        </template>

        <template #cell-leave_type="{ item }">
          <span class="text-sm">{{ item.leave_type?.name }}</span>
        </template>

        <template #cell-dates="{ item }">
          <div class="text-sm">
            <p>{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</p>
            <p class="text-xs text-muted-foreground">{{ item.total_days }} ngày</p>
          </div>
        </template>

        <template #cell-status="{ value }">
          <BaseBadge :variant="getStatusVariant(value)">
            {{ getStatusText(value) }}
          </BaseBadge>
        </template>

        <template #actions="{ item }">
          <div v-if="item.status === 'pending'" class="flex items-center gap-2">
            <button
              @click="approveRequest(item)"
              class="p-1 rounded hover-elevate text-green-600 dark:text-green-400"
              data-testid="button-approve"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              @click="rejectRequest(item)"
              class="p-1 rounded hover-elevate text-red-600 dark:text-red-400"
              data-testid="button-reject"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Create Leave Request Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Tạo đơn xin nghỉ"
      data-testid="modal-create-leave"
    >
      <div class="space-y-4">
        <BaseSelect
          label="Loại nghỉ"
          :options="leaveTypeOptions"
          required
          data-testid="select-leave-type-modal"
        />
        <BaseInput
          type="date"
          label="Từ ngày"
          required
          data-testid="input-start-date-modal"
        />
        <BaseInput
          type="date"
          label="Đến ngày"
          required
          data-testid="input-end-date-modal"
        />
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Lý do</label>
          <textarea
            class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows="4"
            placeholder="Nhập lý do xin nghỉ..."
            data-testid="textarea-reason"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showCreateModal = false">Hủy</BaseButton>
        <BaseButton @click="handleCreate">Tạo đơn</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import type { LeaveRequest, LeaveBalance } from '../types';

const showCreateModal = ref(false);
const requests = ref<LeaveRequest[]>([]);
const balances = ref<LeaveBalance[]>([]);

const filters = ref({
  status: '',
  leaveType: '',
  startDate: ''
});

const columns = [
  { key: 'employee', label: 'Nhân viên' },
  { key: 'leave_type', label: 'Loại nghỉ' },
  { key: 'dates', label: 'Thời gian' },
  { key: 'reason', label: 'Lý do' },
  { key: 'status', label: 'Trạng thái' },
];

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
];

const leaveTypeOptions = [
  { label: 'Nghỉ phép năm', value: '1' },
  { label: 'Nghỉ ốm', value: '2' },
  { label: 'Nghỉ thai sản', value: '3' },
];

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, any> = {
    draft: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    cancelled: 'default'
  };
  return variants[status] || 'default';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: 'Nháp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy'
  };
  return texts[status] || status;
};

const applyFilters = () => {
  console.log('Applying filters:', filters.value);
};

const approveRequest = (request: LeaveRequest) => {
  console.log('Approve:', request);
};

const rejectRequest = (request: LeaveRequest) => {
  console.log('Reject:', request);
};

const handleCreate = () => {
  showCreateModal.value = false;
};

onMounted(() => {
  // Mock data
  balances.value = [
    {
      id: 1,
      employee_id: 1,
      leave_type_id: 1,
      year: 2025,
      total_entitled: 12,
      used: 3,
      remaining: 9,
      carried_over: 0,
      leave_type: { name: 'Phép năm' } as any
    },
    {
      id: 2,
      employee_id: 1,
      leave_type_id: 2,
      year: 2025,
      total_entitled: 7,
      used: 0,
      remaining: 7,
      carried_over: 0,
      leave_type: { name: 'Phép ốm' } as any
    }
  ] as any;

  requests.value = [
    {
      id: 1,
      employee_id: 1,
      employee: { full_name: 'Nguyễn Văn A' } as any,
      leave_type_id: 1,
      leave_type: { name: 'Phép năm' } as any,
      start_date: '2025-01-20',
      end_date: '2025-01-22',
      total_days: 3,
      reason: 'Về quê',
      status: 'pending'
    }
  ] as any;
});
</script>