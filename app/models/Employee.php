<?php

class Employee extends Model
{
    protected string $table = 'employees';

    public function allWithJoins(): array
    {
        $sql = "SELECT 
                    e.*,
                    d.name AS department,
                    jt.name AS job_title,
                    eh.start_date,
                    eh.employment_status
                FROM employees e
                LEFT JOIN employment_histories eh ON eh.id = (
                    SELECT eh2.id FROM employment_histories eh2 
                    WHERE eh2.employee_id = e.id 
                    ORDER BY eh2.start_date DESC 
                    LIMIT 1
                )
                LEFT JOIN departments d ON eh.department_id = d.id
                LEFT JOIN job_titles jt ON eh.job_title_id = jt.id";
        return $this->db->query($sql)->fetchAll();
    }
}
