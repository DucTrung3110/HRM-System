<?php

class LeaveBalanceController extends Controller
{
    public function show(int $employeeId): void
    {
        $rows = $this->db->query(
            "SELECT lb.*, lt.name AS leave_type
             FROM leave_balances lb
             JOIN leave_types lt ON lb.leave_type_id = lt.id
             WHERE lb.employee_id = ?",
            [$employeeId]
        )->fetchAll();
        Response::json($rows);
    }
}
