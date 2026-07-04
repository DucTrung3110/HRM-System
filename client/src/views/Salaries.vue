<template>
  <div class="space-y-6">
    <!-- ═══ Header ═══ -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-foreground">{{ isAdmin ? 'Tính lương' : 'Phiếu lương của tôi' }}</h1>
        <p class="text-sm sm:text-base text-muted-foreground mt-1">
          {{ isAdmin ? 'Bảng lương theo kỳ — engine lương luật Việt Nam' : 'Xem chi tiết lương theo kỳ' }}
        </p>
      </div>
      <div v-if="isAdmin && details.length" class="flex flex-wrap gap-2 items-center">
        <button
          @click="bulkExportExcel"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
        >
          Excel (Cả kỳ)
        </button>
        <button
          @click="bulkExportPDF"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          PDF (Cả kỳ)
        </button>
      </div>
    </div>

    <!-- ═══ Chọn kỳ + hành động ═══ -->
    <BaseCard>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <BaseSelect
          v-model="selectedPeriodId"
          label="Kỳ lương"
          :options="periodOptions"
          data-testid="select-period"
        />
        <div v-if="selectedPeriod" class="pb-1">
          <p class="text-xs text-muted-foreground mb-1">Trạng thái kỳ</p>
          <span :class="periodBadgeClass(selectedPeriod.status)">
            {{ periodStatusVN(selectedPeriod.status) }}
          </span>
          <span class="ml-2 text-xs text-muted-foreground">{{ selectedPeriod.start_date }} → {{ selectedPeriod.end_date }}</span>
        </div>
        <div v-if="isAdmin" class="flex gap-2 lg:col-span-2 lg:justify-end">
          <BaseButton
            :disabled="!selectedPeriodId || periodLocked || runLoading"
            @click="runPayroll"
            data-testid="button-run-payroll"
          >
            <span v-if="runLoading">Đang tính…</span>
            <span v-else>⚡ Tính lương kỳ này</span>
          </BaseButton>
          <BaseButton
            variant="outline"
            :disabled="!selectedPeriodId || periodLocked || !details.length"
            @click="closePeriod"
            data-testid="button-close-period"
          >
            🔒 Chốt kỳ
          </BaseButton>
        </div>
      </div>
      <p v-if="isAdmin && periodLocked" class="mt-3 text-xs text-amber-600">
        Kỳ đã {{ periodStatusVN(selectedPeriod?.status).toLowerCase() }} — không thể tính lại hoặc chỉnh sửa (bảo toàn lương đã trả).
      </p>
      <p v-else-if="isAdmin" class="mt-3 text-xs text-muted-foreground">
        „Tính lương" sẽ tự tổng hợp lại bảng công tháng rồi tính: lương theo công → bảo hiểm → giảm trừ → thuế TNCN (5 bậc, luật 2026) → thực nhận.
      </p>
    </BaseCard>

    <!-- ═══ Thẻ tổng hợp ═══ -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <BaseCard>
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted-foreground">Tổng thu nhập (Gross)</p>
          <p class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1.5">{{ formatMoney(stats.gross) }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted-foreground">Bảo hiểm + Thuế + Khấu trừ</p>
          <p class="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1.5">{{ formatMoney(stats.deductions) }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted-foreground">Thực lĩnh (Net)</p>
          <p class="text-xl sm:text-2xl font-bold text-primary mt-1.5">{{ formatMoney(stats.net) }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted-foreground">{{ isAdmin ? 'Nhân viên đã tính' : 'Ngày công (thực tế/chuẩn)' }}</p>
          <p class="text-xl sm:text-2xl font-bold text-foreground mt-1.5">
            {{ isAdmin ? details.length : myWorkdays }}
          </p>
        </div>
      </BaseCard>
    </div>

    <!-- ═══ Bảng lương kỳ (admin) ═══ -->
    <BaseCard v-if="isAdmin" :title="`Bảng lương ${selectedPeriod?.period_code || ''}`">
      <BaseSkeleton v-if="loading" type="table" />
      <template v-else>
        <div v-if="!details.length" class="text-center py-10 text-muted-foreground">
          <p class="font-medium">Kỳ này chưa có dữ liệu lương</p>
          <p class="text-sm mt-1">Bấm „⚡ Tính lương kỳ này" để chạy engine cho toàn bộ nhân viên.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm" data-testid="table-salary-details">
            <thead>
              <tr class="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th class="py-2.5 pr-3">Nhân viên</th>
                <th class="py-2.5 px-3 text-right">Gross</th>
                <th class="py-2.5 px-3 text-right">Khấu trừ</th>
                <th class="py-2.5 px-3 text-right">Thực lĩnh</th>
                <th class="py-2.5 px-3 text-center">Công</th>
                <th class="py-2.5 px-3 text-center">Tăng ca</th>
                <th class="py-2.5 px-3 text-center">Chuyển khoản</th>
                <th class="py-2.5 pl-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in details"
                :key="d.id"
                class="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors"
              >
                <td class="py-2.5 pr-3">
                  <p class="font-medium text-foreground">{{ d.employee?.full_name || '—' }}</p>
                  <p class="text-xs text-muted-foreground">{{ d.employee?.employee_code }}</p>
                </td>
                <td class="py-2.5 px-3 text-right font-medium text-green-600 dark:text-green-400">{{ formatMoney(d.gross_salary) }}</td>
                <td class="py-2.5 px-3 text-right text-red-600 dark:text-red-400">−{{ formatMoney(d.gross_salary - d.net_salary) }}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-primary">{{ formatMoney(d.net_salary) }}</td>
                <td class="py-2.5 px-3 text-center">
                  <span v-if="prorationDays(d)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200" :title="d.proration">
                    {{ prorationDays(d) }}
                  </span>
                  <span v-else class="text-xs text-muted-foreground">Đủ công</span>
                </td>
                <td class="py-2.5 px-3 text-center text-xs">
                  <span v-if="Number(d.overtime_hours) > 0" class="font-medium">{{ Number(d.overtime_hours) }}h</span>
                  <span v-else class="text-muted-foreground">—</span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span :class="transferBadgeClass(d.transfer_status)">{{ transferStatusVN(d.transfer_status) }}</span>
                </td>
                <td class="py-2.5 pl-3 text-right">
                  <button
                    @click="openPayslip(d)"
                    class="text-primary text-xs font-semibold hover:underline whitespace-nowrap"
                    :data-testid="`button-payslip-${d.id}`"
                  >
                    Phiếu lương →
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </BaseCard>

    <!-- ═══ Phiếu lương của tôi (nhân viên) ═══ -->
    <BaseCard v-if="!isAdmin">
      <BaseSkeleton v-if="loading" type="block" />
      <template v-else>
        <div v-if="!myDetail" class="text-center py-10 text-muted-foreground">
          <p class="font-medium">Kỳ này chưa có phiếu lương của bạn</p>
          <p class="text-sm mt-1">Lương sẽ hiển thị sau khi phòng nhân sự chạy tính lương kỳ.</p>
        </div>
        <div v-else class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p class="font-semibold text-lg">{{ currentUser?.full_name }}</p>
            <p class="text-sm text-muted-foreground">Kỳ {{ selectedPeriod?.period_code }} · Thực lĩnh
              <span class="font-bold text-primary">{{ formatMoney(myDetail.net_salary) }}</span>
            </p>
          </div>
          <BaseButton @click="openPayslip(myDetail)">Xem phiếu lương chi tiết</BaseButton>
        </div>
      </template>
    </BaseCard>

    <!-- ═══ Lịch sử lương (nhân viên) ═══ -->
    <BaseCard v-if="!isAdmin && history.length" title="Lịch sử lương">
      <BaseTable :columns="historyColumns" :data="history" data-testid="table-salary-history">
        <template #cell-period="{ row }">
          <span class="font-medium">{{ row.period?.period_code || row.period_id }}</span>
        </template>
        <template #cell-gross_salary="{ value }">
          <span class="text-green-600 dark:text-green-400">{{ formatMoney(value) }}</span>
        </template>
        <template #cell-deduction="{ row }">
          <span class="text-red-600 dark:text-red-400">−{{ formatMoney(row.gross_salary - row.net_salary) }}</span>
        </template>
        <template #cell-net_salary="{ value }">
          <span class="font-semibold text-primary">{{ formatMoney(value) }}</span>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- ═══ Modal phiếu lương chi tiết ═══ -->
    <BaseModal v-model="payslipOpen" :title="`Phiếu lương — ${payslip?.salary_detail?.employee?.full_name || ''}`" size="lg">
      <BaseSkeleton v-if="payslipLoading" type="block" />
      <div v-else-if="payslip" class="space-y-5">
        <!-- Kỳ + trạng thái -->
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-medium">Kỳ {{ payslip.salary_detail?.period?.period_code }}</span>
          <span class="text-muted-foreground">· Mã NV {{ payslip.salary_detail?.employee?.employee_code }}</span>
          <span v-if="payslipMeta.engine" class="ml-auto text-xs text-muted-foreground">engine: {{ payslipMeta.engine }}</span>
        </div>

        <!-- Công tháng -->
        <div v-if="payslip.attendance_summary" class="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-muted/50 text-center">
          <div><p class="text-[11px] text-muted-foreground">Công chuẩn</p><p class="font-semibold">{{ num(payslip.attendance_summary.standard_days) }}</p></div>
          <div><p class="text-[11px] text-muted-foreground">Đi làm</p><p class="font-semibold">{{ num(payslip.attendance_summary.actual_working_days) }}</p></div>
          <div><p class="text-[11px] text-muted-foreground">Nghỉ phép</p><p class="font-semibold">{{ num(payslip.attendance_summary.paid_leave_days) }}</p></div>
          <div><p class="text-[11px] text-muted-foreground">Vắng</p><p class="font-semibold text-amber-600">{{ num(payslipMeta.proration_absent_days ?? summaryMeta.absent_days ?? 0) }}</p></div>
          <div><p class="text-[11px] text-muted-foreground">Tăng ca</p><p class="font-semibold">{{ num(payslip.attendance_summary.overtime_hours) }}h</p></div>
        </div>

        <!-- Thu nhập -->
        <div>
          <h4 class="text-xs font-bold uppercase text-muted-foreground mb-2">Thu nhập</h4>
          <div class="space-y-1.5">
            <div v-for="b in earningRows" :key="b.item_code" class="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
              <span>
                {{ b.item_name }}
                <span v-if="b.item_code === 'BASE' && payslipMeta.proration_factor < 1" class="ml-1 text-xs text-amber-600">({{ payslipMeta.proration }})</span>
              </span>
              <span class="font-medium text-green-600 dark:text-green-400">+{{ formatMoney(b.amount) }}</span>
            </div>
            <div v-if="Number(payslipMeta.overtime_premium_pay) > 0 && payslipMeta.overtime_premium_tax_exempt" class="flex justify-between text-xs text-muted-foreground pl-3">
              <span>↳ trong đó phụ trội tăng ca <span class="text-green-600 font-medium">miễn thuế TNCN</span> (luật 01/07/2026)</span>
              <span>{{ formatMoney(payslipMeta.overtime_premium_pay) }}</span>
            </div>
          </div>
        </div>

        <!-- Khấu trừ -->
        <div>
          <h4 class="text-xs font-bold uppercase text-muted-foreground mb-2">Khấu trừ</h4>
          <div class="space-y-1.5">
            <div v-for="b in deductionRows" :key="b.item_code" class="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
              <span>{{ b.item_name }}</span>
              <span class="font-medium text-red-600 dark:text-red-400">−{{ formatMoney(b.amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Căn cứ thuế -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-center">
          <div><p class="text-[11px] text-muted-foreground">Thu nhập chịu thuế</p><p class="font-semibold">{{ formatMoney(payslipMeta.taxable_income || 0) }}</p></div>
          <div><p class="text-[11px] text-muted-foreground">Giảm trừ gia cảnh</p><p class="font-semibold">{{ formatMoney(payslipMeta.personal_relief || 0) }}</p></div>
          <div><p class="text-[11px] text-muted-foreground">Người phụ thuộc</p><p class="font-semibold">{{ payslipMeta.dependents ?? 0 }}</p></div>
        </div>

        <!-- NET -->
        <div class="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/20">
          <span class="font-bold">THỰC LĨNH (NET)</span>
          <span class="text-2xl font-extrabold text-primary">{{ formatMoney(payslip.salary_detail?.net_salary) }}</span>
        </div>

        <!-- Chi phí DN (thu gọn) -->
        <details v-if="employerRows.length" class="text-sm">
          <summary class="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">Chi phí doanh nghiệp đóng (BHXH/BHYT/BHTN) ▾</summary>
          <div class="mt-2 space-y-1.5 pl-2">
            <div v-for="b in employerRows" :key="b.item_code" class="flex justify-between py-0.5 text-muted-foreground">
              <span>{{ b.item_name }}</span><span>{{ formatMoney(b.amount) }}</span>
            </div>
          </div>
        </details>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="exportPayslipExcel" :disabled="!payslip">Xuất Excel</BaseButton>
        <BaseButton variant="outline" @click="exportPayslipPDF" :disabled="!payslip">In / PDF</BaseButton>
        <BaseButton variant="ghost" @click="payslipOpen = false">Đóng</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseTable from '../components/BaseTable.vue';
import BaseModal from '../components/BaseModal.vue';
import BaseSkeleton from '../components/BaseSkeleton.vue';
import { salaryService } from '../services/salaryService';
import { authService } from '../services/authService';
import { useNotificationStore } from '../stores/notificationStore';
import * as XLSX from 'xlsx';

const notificationStore = useNotificationStore();
const isAdmin = computed(() => authService.isAdmin());
const currentUser = computed(() => authService.getUser());
// user lưu trong localStorage chính là bản ghi employee → id = employee_id
const selfEmployeeId = computed(() => currentUser.value?.employee_id || currentUser.value?.id || null);

// ── State ──
const periods = ref([]);
const selectedPeriodId = ref('');
const details = ref([]);        // salary_details của kỳ đang chọn (meta đã flatten)
const history = ref([]);        // NV: chi tiết lương của mình qua các kỳ
const loading = ref(false);
const runLoading = ref(false);

const payslipOpen = ref(false);
const payslipLoading = ref(false);
const payslip = ref(null);      // { salary_detail, breakdowns, attendance_summary }

// Trạng thái kỳ khóa tính lại (đồng bộ với PayrollRunService::LOCKED_PERIOD_STATUSES)
const LOCKED_STATUSES = ['CLOSED', 'LOCKED', 'PAID', 'ĐÃ_ĐÓNG', 'DA_DONG', 'ĐÃ_TRẢ', 'DA_TRA'];

const selectedPeriod = computed(() => periods.value.find(p => String(p.id) === String(selectedPeriodId.value)) || null);
const periodLocked = computed(() => selectedPeriod.value && LOCKED_STATUSES.includes(String(selectedPeriod.value.status)));

const periodOptions = computed(() => [
  { label: 'Chọn kỳ lương', value: '' },
  ...periods.value.map(p => ({
    label: `${p.period_code} — ${periodStatusVN(p.status)}`,
    value: String(p.id),
  })),
]);

const stats = computed(() => {
  const rows = isAdmin.value ? details.value : (myDetail.value ? [myDetail.value] : []);
  const gross = rows.reduce((s, d) => s + Number(d.gross_salary || 0), 0);
  const net = rows.reduce((s, d) => s + Number(d.net_salary || 0), 0);
  return { gross, net, deductions: gross - net };
});

const myDetail = computed(() =>
  isAdmin.value ? null : details.value.find(d => Number(d.employee_id) === Number(selfEmployeeId.value)) || details.value[0] || null
);

const myWorkdays = computed(() => {
  const d = myDetail.value;
  if (!d) return '—';
  const std = Number(d.standard_days ?? 0);
  // meta flatten: proration_absent_days có sẵn trên item
  const absent = Number(d.proration_absent_days ?? 0);
  if (!std && !absent) return '—';
  return `${Math.max(0, std - absent)}/${std || '?'}`;
});

const historyColumns = [
  { key: 'period', label: 'Kỳ' },
  { key: 'gross_salary', label: 'Thu nhập' },
  { key: 'deduction', label: 'Khấu trừ' },
  { key: 'net_salary', label: 'Thực lĩnh' },
];

// ── Payslip computed (breakdowns từ engine) ──
const payslipMeta = computed(() => {
  let m = payslip.value?.salary_detail?.meta;
  if (typeof m === 'string') { try { m = JSON.parse(m); } catch { m = {}; } }
  return m || {};
});
const summaryMeta = computed(() => {
  let m = payslip.value?.attendance_summary?.meta;
  if (typeof m === 'string') { try { m = JSON.parse(m); } catch { m = {}; } }
  return m || {};
});
const breakdowns = computed(() => payslip.value?.breakdowns || []);
const earningRows = computed(() => breakdowns.value.filter(b => b.item_type === 'EARNING' && Number(b.amount) > 0));
const deductionRows = computed(() => breakdowns.value.filter(b => b.item_type === 'DEDUCTION' && Number(b.amount) > 0));
const employerRows = computed(() => breakdowns.value.filter(b => b.item_type === 'EMPLOYER_COST' && Number(b.amount) > 0));

// ── Helpers hiển thị ──
const formatMoney = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(amount) || 0);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? (Number.isInteger(n) ? n : n.toFixed(1)) : '—';
};

const periodStatusVN = (s) => ({
  OPEN: 'Đang mở', PAID: 'Đã trả lương', CLOSED: 'Đã chốt', LOCKED: 'Đã khóa',
}[String(s)] || s || '—');
const periodBadgeClass = (s) => {
  const base = 'inline-block px-2.5 py-1 rounded-full text-xs font-semibold ';
  if (String(s) === 'OPEN') return base + 'bg-green-50 text-green-700 border border-green-200';
  if (String(s) === 'PAID') return base + 'bg-blue-50 text-blue-700 border border-blue-200';
  return base + 'bg-gray-100 text-gray-600 border border-gray-200';
};
const transferStatusVN = (s) => ({ PENDING: 'Chờ chuyển', PAID: 'Đã chuyển', TRANSFERRED: 'Đã chuyển', FAILED: 'Lỗi' }[String(s)] || s || '—');
const transferBadgeClass = (s) => {
  const base = 'inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ';
  if (['PAID', 'TRANSFERRED'].includes(String(s))) return base + 'bg-green-50 text-green-700';
  if (String(s) === 'FAILED') return base + 'bg-red-50 text-red-700';
  return base + 'bg-amber-50 text-amber-700';
};
// "PRORATED 22/26 (…)" → "22/26" ; đủ công → null
const prorationDays = (d) => {
  const label = d.proration || '';
  const m = /PRORATED\s+([\d.]+\/[\d.]+)/.exec(label);
  return m ? m[1] : null;
};

// ── Data loading ──
const loadPeriods = async () => {
  const res = await salaryService.getPeriods();
  const list = Array.isArray(res) ? res : (res?.items || res?.data || []);
  periods.value = list;
  // Mặc định chọn kỳ mở gần nhất, không có thì kỳ mới nhất
  if (!selectedPeriodId.value && list.length) {
    const open = list.find(p => String(p.status) === 'OPEN');
    selectedPeriodId.value = String((open || list[0]).id);
  }
};

const loadDetails = async () => {
  if (!selectedPeriodId.value) { details.value = []; return; }
  loading.value = true;
  try {
    const params = { period_id: selectedPeriodId.value, per_page: 100 };
    if (!isAdmin.value) params.employee_id = selfEmployeeId.value;
    const res = await salaryService.getDetails(params);
    details.value = Array.isArray(res) ? res : (res?.items || []);
  } catch (err) {
    console.error('Error loading salary details:', err);
    details.value = [];
    notificationStore.addError('Không tải được bảng lương kỳ này');
  } finally {
    loading.value = false;
  }
};

const loadHistory = async () => {
  if (isAdmin.value || !selfEmployeeId.value) return;
  try {
    const res = await salaryService.getDetails({ employee_id: selfEmployeeId.value, per_page: 24 });
    history.value = Array.isArray(res) ? res : (res?.items || []);
  } catch { history.value = []; }
};

// ── Actions ──
const runPayroll = async () => {
  if (!selectedPeriodId.value || periodLocked.value) return;
  runLoading.value = true;
  try {
    const res = await salaryService.runPayroll(Number(selectedPeriodId.value));
    const processed = res?.employees_processed ?? res?.data?.employees_processed;
    notificationStore.addSuccess(`Đã tính lương cho ${processed ?? '?'} nhân viên`);
    await loadDetails();
  } catch (err) {
    const msg = err.response?.data?.message || 'Không thể tính lương';
    notificationStore.addError(msg);
  } finally {
    runLoading.value = false;
  }
};

const closePeriod = async () => {
  if (!selectedPeriodId.value || periodLocked.value) return;
  if (!window.confirm(`Chốt kỳ ${selectedPeriod.value?.period_code}? Sau khi chốt sẽ KHÔNG thể tính lại lương kỳ này.`)) return;
  try {
    await salaryService.closePeriod(Number(selectedPeriodId.value));
    notificationStore.addSuccess('Đã chốt kỳ lương');
    await loadPeriods();
    await loadDetails();
  } catch (err) {
    notificationStore.addError(err.response?.data?.message || 'Không thể chốt kỳ');
  }
};

const openPayslip = async (detail) => {
  payslipOpen.value = true;
  payslipLoading.value = true;
  payslip.value = null;
  try {
    const res = await salaryService.getPayslip(detail.id);
    payslip.value = res;
  } catch (err) {
    console.error('Error loading payslip:', err);
    notificationStore.addError('Không tải được phiếu lương');
    payslipOpen.value = false;
  } finally {
    payslipLoading.value = false;
  }
};

// ── Exports (từ dữ liệu engine thật) ──
const sanitizeFilename = (str) =>
  String(str).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s.-]/g, '_').trim();

const exportPayslipExcel = () => {
  if (!payslip.value) return;
  const d = payslip.value.salary_detail;
  const name = d?.employee?.full_name || 'NV';
  const data = [
    ['PHIẾU LƯƠNG NHÂN VIÊN'],
    [],
    ['Họ tên', name],
    ['Mã NV', d?.employee?.employee_code || ''],
    ['Kỳ lương', d?.period?.period_code || ''],
    ['Ngày xuất', new Date().toLocaleDateString('vi-VN')],
    [],
    ['KHOẢN MỤC', 'LOẠI', 'SỐ TIỀN (VNĐ)'],
    ...earningRows.value.map(b => [b.item_name, 'Thu nhập', Number(b.amount)]),
    ...deductionRows.value.map(b => [b.item_name, 'Khấu trừ', -Number(b.amount)]),
    [],
    ['Thu nhập chịu thuế', '', Number(payslipMeta.value.taxable_income || 0)],
    ['Giảm trừ gia cảnh', '', Number(payslipMeta.value.personal_relief || 0)],
    ['THỰC LĨNH (NET)', '', Number(d?.net_salary || 0)],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 38 }, { wch: 14 }, { wch: 20 }];
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  Object.keys(ws).forEach(k => { if (!k.startsWith('!') && typeof ws[k].v === 'number') ws[k].z = '#,##0'; });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PhieuLuong');
  XLSX.writeFile(wb, `PhieuLuong_${sanitizeFilename(name)}_${d?.period?.period_code || ''}.xlsx`);
  notificationStore.addSuccess('Đã xuất Excel phiếu lương');
};

const payslipHTML = (d, rowsE, rowsD, meta, att) => {
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
  const tr = (nm, amt, sign, color) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${nm}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:${color};font-weight:600">${sign}${fmt(amt)}</td></tr>`;
  const eRows = rowsE.map(b => tr(b.item_name, b.amount, '+', '#16a34a')).join('');
  const dRows = rowsD.map(b => tr(b.item_name, b.amount, '−', '#dc2626')).join('');
  const attLine = att
    ? `<div style="font-size:12px;color:#6b7280;margin-bottom:16px">Công chuẩn ${att.standard_days} · Đi làm ${att.actual_working_days} · Nghỉ phép ${att.paid_leave_days} · Tăng ca ${att.overtime_hours}h</div>`
    : '';
  return `
    <div class="page">
      <div class="header">
        <div><div class="company">CODEDENNGU</div><div style="font-size:12px;color:#6b7280;margin-top:4px">Hệ thống Quản lý Nhân sự</div></div>
        <div style="text-align:right"><div style="font-size:20px;font-weight:700">PHIẾU LƯƠNG</div>
        <div style="font-size:12px;color:#6b7280">Kỳ: ${d?.period?.period_code || ''} | Xuất: ${new Date().toLocaleDateString('vi-VN')}</div></div>
      </div>
      <div class="info-grid">
        <div class="info-item"><label>Họ và tên</label><span>${d?.employee?.full_name || ''}</span></div>
        <div class="info-item"><label>Mã nhân viên</label><span>${d?.employee?.employee_code || ''}</span></div>
      </div>
      ${attLine}
      <h4>Thu nhập</h4>
      <table><thead><tr><th>Khoản mục</th><th style="text-align:right">Số tiền</th></tr></thead><tbody>${eRows}</tbody></table>
      <h4>Khấu trừ</h4>
      <table><thead><tr><th>Khoản mục</th><th style="text-align:right">Số tiền</th></tr></thead><tbody>${dRows}</tbody></table>
      <div class="summary">
        <div class="summary-row"><span>Thu nhập chịu thuế</span><span>${fmt(meta.taxable_income)}</span></div>
        <div class="summary-row"><span>Giảm trừ gia cảnh (${meta.dependents ?? 0} người phụ thuộc)</span><span>${fmt(meta.personal_relief)}</span></div>
        <div class="summary-row net"><span>Lương thực lĩnh</span><span>${fmt(d?.net_salary)}</span></div>
      </div>
      <div class="footer"><p>Phiếu lương tạo tự động bởi engine lương (luật VN 2026) — ${new Date().toLocaleDateString('vi-VN')}</p></div>
    </div>`;
};

const PAYSLIP_CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#111827;background:#fff}
  .page{max-width:700px;margin:0 auto;padding:40px 32px;page-break-after:always}
  .page:last-child{page-break-after:avoid}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:3px solid #2563eb;padding-bottom:16px}
  .company{font-size:22px;font-weight:800;color:#2563eb}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px;margin-bottom:16px;padding:16px 20px;background:#f9fafb;border-radius:10px}
  .info-item label{font-size:11px;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:2px}
  .info-item span{font-size:14px;font-weight:600}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  thead th{background:#f3f4f6;padding:9px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280}
  thead th:last-child{text-align:right}
  h4{font-size:13px;font-weight:700;color:#374151;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #e5e7eb}
  .summary{background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;padding:14px 20px}
  .summary-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;color:#374151}
  .summary-row.net{border-top:1px solid #93c5fd;margin-top:10px;padding-top:10px;font-size:16px;font-weight:800;color:#1d4ed8}
  .footer{text-align:center;margin-top:24px;font-size:11px;color:#9ca3af}
  @media print{.page{padding:20px}}`;

const openPrintWindow = (title, bodyHTML) => {
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title><style>${PAYSLIP_CSS}</style></head>
<body>${bodyHTML}<scr` + `ipt>window.onload=()=>window.print();</scr` + `ipt></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'width=800,height=900');
  if (w) w.addEventListener('unload', () => URL.revokeObjectURL(url));
};

const exportPayslipPDF = () => {
  if (!payslip.value) return;
  const d = payslip.value.salary_detail;
  openPrintWindow(
    `Phiếu lương - ${d?.employee?.full_name || ''}`,
    payslipHTML(d, earningRows.value, deductionRows.value, payslipMeta.value, payslip.value.attendance_summary)
  );
};

// Bảng lương cả kỳ — MỘT nguồn dữ liệu (salary_details), không gọi N+1 API
const bulkExportExcel = () => {
  if (!details.value.length) return;
  const data = [
    ['BẢNG LƯƠNG TỔNG HỢP — KỲ ' + (selectedPeriod.value?.period_code || '')],
    ['Ngày xuất', new Date().toLocaleDateString('vi-VN')],
    [],
    ['STT', 'Mã NV', 'Họ tên', 'Gross', 'Khấu trừ', 'Thực lĩnh', 'Công', 'Tăng ca (h)'],
    ...details.value.map((d, i) => [
      i + 1,
      d.employee?.employee_code || '',
      d.employee?.full_name || '',
      Number(d.gross_salary || 0),
      -Number((d.gross_salary || 0) - (d.net_salary || 0)),
      Number(d.net_salary || 0),
      prorationDays(d) || 'Đủ',
      Number(d.overtime_hours || 0),
    ]),
    [],
    ['', '', 'TỔNG CỘNG', stats.value.gross, -stats.value.deductions, stats.value.net, '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 26 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 8 }, { wch: 10 }];
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  Object.keys(ws).forEach(k => { if (!k.startsWith('!') && typeof ws[k].v === 'number') ws[k].z = '#,##0'; });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BangLuong');
  XLSX.writeFile(wb, `BangLuong_${selectedPeriod.value?.period_code || 'ky'}.xlsx`);
  notificationStore.addSuccess('Đã xuất bảng lương cả kỳ');
};

const bulkExportPDF = async () => {
  if (!details.value.length) return;
  notificationStore.addInfo('Đang tạo phiếu lương cả kỳ…');
  try {
    // Lấy payslip chi tiết từng NV từ engine (tuần tự để nhẹ server)
    let pages = '';
    for (const d of details.value) {
      try {
        const res = await salaryService.getPayslip(d.id);
        let meta = res?.salary_detail?.meta;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch { meta = {}; } }
        const bds = res?.breakdowns || [];
        pages += payslipHTML(
          res.salary_detail,
          bds.filter(b => b.item_type === 'EARNING' && Number(b.amount) > 0),
          bds.filter(b => b.item_type === 'DEDUCTION' && Number(b.amount) > 0),
          meta || {},
          res.attendance_summary
        );
      } catch { /* bỏ qua NV lỗi, in phần còn lại */ }
    }
    if (!pages) { notificationStore.addError('Không có phiếu lương nào để in'); return; }
    openPrintWindow(`Phiếu lương kỳ ${selectedPeriod.value?.period_code || ''}`, pages);
  } finally { /* noop */ }
};

// ── Wiring ──
watch(selectedPeriodId, loadDetails);

onMounted(async () => {
  loading.value = true;
  try {
    await loadPeriods();
    await loadDetails();
    await loadHistory();
  } catch (err) {
    console.error('Salary page init error:', err);
    notificationStore.addError('Không tải được dữ liệu lương');
  } finally {
    loading.value = false;
  }
});
</script>
