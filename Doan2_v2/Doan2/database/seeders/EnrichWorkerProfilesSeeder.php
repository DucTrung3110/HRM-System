<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Làm đầy hồ sơ 1.200 công nhân seed hàng loạt cho KHỚP cấu trúc hồ sơ nhân viên
 * văn phòng. ScaleWorkerSeeder chỉ tạo tên + lương, để trống DOB/SĐT/CCCD/MST/BHXH/
 * bank/địa chỉ và gán giới tính theo số CN (không khớp tên → "Đinh Kim Yến - Nam").
 *
 * Ở đây: sinh dữ liệu TẤT ĐỊNH theo số CN (idempotent, không cần random), đặt lại
 * đệm+tên cho khớp giới tính, và điền đủ profile theo đúng bộ khoá mà nhân viên văn
 * phòng đang dùng (id_number, tax_number, bank_*, insurance_number, emergency_*…).
 *
 * Idempotent: chỉ đụng CN CHƯA có profile->id_number → chạy lại không ghi đè.
 * Đồng thời chuẩn hoá giới tính NAM/NỮ → MALE/FEMALE (canonical như EmployeeController).
 */
class EnrichWorkerProfilesSeeder extends Seeder
{
    private array $midMale = ['Văn', 'Hữu', 'Đức', 'Công', 'Quang', 'Minh', 'Bá', 'Đình', 'Gia', 'Mạnh'];
    private array $midFemale = ['Thị', 'Ngọc', 'Thu', 'Hồng', 'Phương', 'Kim', 'Thanh', 'Mỹ', 'Diễm', 'Bích'];
    private array $givenMale = ['An', 'Bình', 'Cường', 'Dũng', 'Phúc', 'Hải', 'Hùng', 'Khoa', 'Lâm', 'Long', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Trung', 'Tuấn', 'Đạt', 'Thắng', 'Huy', 'Kiên', 'Bảo', 'Khánh', 'Vinh', 'Thành'];
    private array $givenFemale = ['Mai', 'Oanh', 'Thảo', 'Vy', 'Yến', 'Nhung', 'Trang', 'Loan', 'Ngân', 'Hạnh', 'Linh', 'Hà', 'Lan', 'Hương', 'Trinh', 'Nga', 'Huyền', 'Ánh', 'Thùy', 'Vân'];
    private array $banks = ['Vietcombank', 'BIDV', 'VietinBank', 'MB Bank', 'ACB', 'Techcombank', 'Agribank', 'Sacombank', 'VPBank', 'TPBank'];
    private array $cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Đồng Nai', 'Bình Dương', 'Nam Định', 'Thanh Hóa', 'Nghệ An', 'Bắc Ninh', 'Hưng Yên'];
    private array $streets = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Lý Thường Kiệt', 'Hai Bà Trưng', 'Nguyễn Trãi', 'Cách Mạng Tháng 8', 'Điện Biên Phủ', 'Phan Đình Phùng', 'Hùng Vương'];
    private array $prefixes = ['090', '091', '093', '094', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085', '088'];
    private array $edu = ['THPT', 'Trung cấp nghề', 'Cao đẳng', 'THCS'];

    public function run(): void
    {
        $tenantId = 1;

        // Chuẩn hoá giới tính về canonical MALE/FEMALE (EmployeeController tự quy đổi
        // NAM→MALE, NỮ→FEMALE khi ghi; 20 hồ sơ demo cũ còn để tiếng Việt → đồng bộ).
        DB::table('employees')->where('tenant_id', $tenantId)->where('gender', 'NAM')->update(['gender' => 'MALE']);
        DB::table('employees')->where('tenant_id', $tenantId)->where('gender', 'NỮ')->update(['gender' => 'FEMALE']);

        $workers = DB::table('employees')
            ->where('tenant_id', $tenantId)
            ->where('employee_code', 'like', 'CN%')
            ->get(['id', 'employee_code', 'full_name', 'gender', 'profile', 'legal_entity_id']);

        $enriched = 0;
        foreach ($workers as $w) {
            $profile = json_decode($w->profile ?: '{}', true) ?: [];
            if (! empty($profile['id_number'])) {
                continue; // đã làm đầy
            }

            $n = (int) substr($w->employee_code, 2);
            $female = strtoupper((string) $w->gender) === 'FEMALE';

            // Giữ họ hiện tại, đặt lại đệm + tên cho khớp giới tính.
            $ho = trim(explode(' ', trim((string) $w->full_name))[0] ?: 'Nguyễn');
            $mid = $female ? $this->midFemale[($n * 3) % count($this->midFemale)] : $this->midMale[($n * 3) % count($this->midMale)];
            $given = $female ? $this->givenFemale[($n * 7) % count($this->givenFemale)] : $this->givenMale[($n * 7) % count($this->givenMale)];
            $fullName = "$ho $mid $given";

            $city = $this->cities[($n * 5) % count($this->cities)];
            $street = $this->streets[($n * 11) % count($this->streets)];
            $house = 1 + ($n % 300);
            $addr = "Số $house, đường $street, $city";

            // DOB: tuổi 20..55, tất định theo số CN.
            $age = 20 + (($n * 7) % 36);
            $dob = sprintf('%04d-%02d-%02d', 2026 - $age, 1 + ($n % 12), 1 + ($n % 28));

            $phone = $this->prefixes[($n * 17) % count($this->prefixes)]
                . str_pad((string) (($n * 7919) % 10000000), 7, '0', STR_PAD_LEFT);
            $cccd = sprintf('%03d', (($n * 7) % 96) + 1) . str_pad((string) (($n * 100003) % 1000000000), 9, '0', STR_PAD_LEFT);
            $tax = str_pad((string) (8000000000 + $n * 3), 10, '0', STR_PAD_LEFT);
            $bankAcc = str_pad((string) (190200000000 + $n * 17), 12, '0', STR_PAD_LEFT);
            $bhxh = str_pad((string) (3100000000 + $n * 7), 10, '0', STR_PAD_LEFT);
            $bank = $this->banks[($n * 13) % count($this->banks)];

            $slug = $this->slug($given) . $n;
            $pmail = $slug . '@gmail.com';
            $married = ($n % 5) !== 0; // ~80% đã kết hôn
            $ecName = trim($ho . ' ' . ($female ? $this->midMale[($n * 2) % count($this->midMale)] . ' ' . $this->givenMale[($n * 5) % count($this->givenMale)]
                : $this->midFemale[($n * 2) % count($this->midFemale)] . ' ' . $this->givenFemale[($n * 5) % count($this->givenFemale)]));
            $ecRel = $married ? ($female ? 'Chồng' : 'Vợ') : ($female ? 'Mẹ' : 'Bố');
            $ecPhone = $this->prefixes[($n * 19) % count($this->prefixes)]
                . str_pad((string) (($n * 6271) % 10000000), 7, '0', STR_PAD_LEFT);

            $profile = array_merge($profile, [
                'address' => $addr,
                'permanent_address' => $addr,
                'hometown' => $city,
                'ethnicity' => 'Kinh',
                'religion' => 'Không',
                'nationality_name' => 'Việt Nam',
                'marital_status' => $married ? 'MARRIED' : 'SINGLE',
                'education_level' => $this->edu[($n * 23) % count($this->edu)],
                'id_number' => $cccd,
                'id_issue_date' => sprintf('%04d-%02d-%02d', 2026 - $age + 18, 1 + ($n % 12), 1 + ($n % 27)),
                'id_issue_place' => 'Cục Cảnh sát QLHC về TTXH',
                'tax_number' => $tax,
                'insurance_number' => $bhxh,
                'bank_name' => $bank,
                'bank_account' => $bankAcc,
                'personal_email' => $pmail,
                'personal_phone' => $phone,
                'emergency_contact_name' => $ecName,
                'emergency_contact_phone' => $ecPhone,
                'emergency_contact_relationship' => $ecRel,
            ]);

            DB::table('employees')->where('id', $w->id)->update([
                'full_name' => $fullName,
                'date_of_birth' => $dob,
                'phone_number' => $phone,
                'personal_email' => $pmail,
                'profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
            $enriched++;
        }

        $this->command?->info("EnrichWorkerProfilesSeeder: làm đầy hồ sơ {$enriched} công nhân.");
    }

    private function slug(string $s): string
    {
        $from = ['à','á','ả','ã','ạ','ă','ằ','ắ','ẳ','ẵ','ặ','â','ầ','ấ','ẩ','ẫ','ậ','đ','è','é','ẻ','ẽ','ẹ','ê','ề','ế','ể','ễ','ệ','ì','í','ỉ','ĩ','ị','ò','ó','ỏ','õ','ọ','ô','ồ','ố','ổ','ỗ','ộ','ơ','ờ','ớ','ở','ỡ','ợ','ù','ú','ủ','ũ','ụ','ư','ừ','ứ','ử','ữ','ự','ỳ','ý','ỷ','ỹ','ỵ'];
        $to = ['a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','d','e','e','e','e','e','e','e','e','e','e','e','i','i','i','i','i','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','u','u','u','u','u','u','u','u','u','u','u','y','y','y','y','y'];

        return str_replace($from, $to, mb_strtolower($s));
    }
}
