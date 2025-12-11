<?php

class LeaveTypeController extends Controller
{
    public function index(): void
    {
        $rows = $this->db->query("SELECT * FROM leave_types")->fetchAll();
        Response::json($rows);
    }
}
