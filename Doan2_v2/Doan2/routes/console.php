<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Nhắc hạn hợp đồng/thử việc/chứng chỉ — 07:00 hàng ngày (job tự chống spam).
Schedule::command('hrm:expiry-reminders')->dailyAt('07:00');

Schedule::command('attendance:create-next-partition')
    ->monthlyOn(1, '00:05')
    ->withoutOverlapping();
