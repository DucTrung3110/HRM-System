import { createServer } from "http";
import { db } from "./storage.js";
import * as schema from "../shared/schema.js";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export function registerRoutes(app) {
  
  // ========== AUTH ROUTES ==========
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const [role] = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.id, user.role_id))
        .limit(1);

      res.json({ 
        user: { ...user, password: undefined },
        role 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== EMPLOYEES ROUTES ==========
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await db
        .select({
          id: schema.employees.id,
          employee_code: schema.employees.employee_code,
          full_name: schema.employees.full_name,
          email: schema.employees.email,
          phone: schema.employees.phone,
          department_name: schema.departments.name,
          job_title_name: schema.jobTitles.name,
          hire_date: schema.employees.hire_date,
          is_active: schema.employees.is_active,
        })
        .from(schema.employees)
        .leftJoin(schema.departments, eq(schema.employees.department_id, schema.departments.id))
        .leftJoin(schema.jobTitles, eq(schema.employees.job_title_id, schema.jobTitles.id))
        .orderBy(desc(schema.employees.created_at));

      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const [employee] = await db
        .select()
        .from(schema.employees)
        .where(eq(schema.employees.id, parseInt(req.params.id)))
        .limit(1);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const [employee] = await db.insert(schema.employees).values(req.body).returning();
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const [employee] = await db
        .update(schema.employees)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.employees.id, parseInt(req.params.id)))
        .returning();

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      await db.delete(schema.employees).where(eq(schema.employees.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== DEPARTMENTS ROUTES ==========
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await db.select().from(schema.departments).orderBy(schema.departments.name);
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const [department] = await db.insert(schema.departments).values(req.body).returning();
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const [department] = await db
        .update(schema.departments)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.departments.id, parseInt(req.params.id)))
        .returning();

      res.json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      await db.delete(schema.departments).where(eq(schema.departments.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ROLES ROUTES ==========
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await db.select().from(schema.roles).orderBy(schema.roles.name);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const [role] = await db.insert(schema.roles).values(req.body).returning();
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const [role] = await db
        .update(schema.roles)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.roles.id, parseInt(req.params.id)))
        .returning();

      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      await db.delete(schema.roles).where(eq(schema.roles.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== JOB TITLES ROUTES ==========
  app.get("/api/job-titles", async (req, res) => {
    try {
      const jobTitles = await db.select().from(schema.jobTitles).orderBy(schema.jobTitles.name);
      res.json(jobTitles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/job-titles", async (req, res) => {
    try {
      const [jobTitle] = await db.insert(schema.jobTitles).values(req.body).returning();
      res.json(jobTitle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ATTENDANCE ROUTES ==========
  app.get("/api/attendance", async (req, res) => {
    try {
      const { start_date, end_date, employee_id } = req.query;
      
      let query = db
        .select({
          id: schema.attendance.id,
          employee_id: schema.attendance.employee_id,
          employee_name: schema.employees.full_name,
          attendance_date: schema.attendance.attendance_date,
          check_in_time: schema.attendance.check_in_time,
          check_out_time: schema.attendance.check_out_time,
          status: schema.attendance.status,
          notes: schema.attendance.notes,
        })
        .from(schema.attendance)
        .leftJoin(schema.employees, eq(schema.attendance.employee_id, schema.employees.id));

      if (start_date && end_date) {
        query = query.where(
          and(
            gte(schema.attendance.attendance_date, start_date),
            lte(schema.attendance.attendance_date, end_date)
          )
        );
      }

      if (employee_id) {
        query = query.where(eq(schema.attendance.employee_id, parseInt(employee_id)));
      }

      const records = await query.orderBy(desc(schema.attendance.attendance_date));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/attendance/check-in", async (req, res) => {
    try {
      const { employee_id } = req.body;
      const today = new Date().toISOString().split('T')[0];

      const [existing] = await db
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.employee_id, employee_id),
            eq(schema.attendance.attendance_date, today)
          )
        )
        .limit(1);

      if (existing) {
        return res.status(400).json({ error: "Already checked in today" });
      }

      const [record] = await db.insert(schema.attendance).values({
        employee_id,
        attendance_date: today,
        check_in_time: new Date(),
        status: 'present',
      }).returning();

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/attendance/check-out", async (req, res) => {
    try {
      const { employee_id } = req.body;
      const today = new Date().toISOString().split('T')[0];

      const [record] = await db
        .update(schema.attendance)
        .set({ check_out_time: new Date(), updated_at: new Date() })
        .where(
          and(
            eq(schema.attendance.employee_id, employee_id),
            eq(schema.attendance.attendance_date, today)
          )
        )
        .returning();

      if (!record) {
        return res.status(404).json({ error: "No check-in record found" });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== LEAVES ROUTES ==========
  app.get("/api/leaves", async (req, res) => {
    try {
      const { employee_id } = req.query;
      
      let query = db
        .select({
          id: schema.leaveRequests.id,
          employee_id: schema.leaveRequests.employee_id,
          employee_name: schema.employees.full_name,
          leave_type: schema.leaveRequests.leave_type,
          start_date: schema.leaveRequests.start_date,
          end_date: schema.leaveRequests.end_date,
          days_count: schema.leaveRequests.days_count,
          reason: schema.leaveRequests.reason,
          status: schema.leaveRequests.status,
          created_at: schema.leaveRequests.created_at,
        })
        .from(schema.leaveRequests)
        .leftJoin(schema.employees, eq(schema.leaveRequests.employee_id, schema.employees.id));

      if (employee_id) {
        query = query.where(eq(schema.leaveRequests.employee_id, parseInt(employee_id)));
      }

      const requests = await query.orderBy(desc(schema.leaveRequests.created_at));
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/leaves", async (req, res) => {
    try {
      const [leave] = await db.insert(schema.leaveRequests).values(req.body).returning();
      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/leaves/:id/approve", async (req, res) => {
    try {
      const { approved_by } = req.body;
      const [leave] = await db
        .update(schema.leaveRequests)
        .set({ 
          status: 'approved', 
          approved_by,
          approved_at: new Date(),
          updated_at: new Date() 
        })
        .where(eq(schema.leaveRequests.id, parseInt(req.params.id)))
        .returning();

      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/leaves/:id/reject", async (req, res) => {
    try {
      const { approved_by } = req.body;
      const [leave] = await db
        .update(schema.leaveRequests)
        .set({ 
          status: 'rejected', 
          approved_by,
          approved_at: new Date(),
          updated_at: new Date() 
        })
        .where(eq(schema.leaveRequests.id, parseInt(req.params.id)))
        .returning();

      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== SALARIES ROUTES ==========
  app.get("/api/salaries", async (req, res) => {
    try {
      const { month, employee_id } = req.query;
      
      let query = db
        .select({
          id: schema.salaries.id,
          employee_id: schema.salaries.employee_id,
          employee_name: schema.employees.full_name,
          month: schema.salaries.month,
          base_salary: schema.salaries.base_salary,
          allowances: schema.salaries.allowances,
          bonuses: schema.salaries.bonuses,
          deductions: schema.salaries.deductions,
          net_salary: schema.salaries.net_salary,
          working_days: schema.salaries.working_days,
          actual_days: schema.salaries.actual_days,
        })
        .from(schema.salaries)
        .leftJoin(schema.employees, eq(schema.salaries.employee_id, schema.employees.id));

      if (month) {
        query = query.where(eq(schema.salaries.month, month));
      }

      if (employee_id) {
        query = query.where(eq(schema.salaries.employee_id, parseInt(employee_id)));
      }

      const salaries = await query.orderBy(desc(schema.salaries.month));
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/salaries", async (req, res) => {
    try {
      const [salary] = await db.insert(schema.salaries).values(req.body).returning();
      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== DASHBOARD STATS ==========
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [totalEmployees] = await db
        .select({ count: sql`count(*)::int` })
        .from(schema.employees)
        .where(eq(schema.employees.is_active, true));

      const [totalDepartments] = await db
        .select({ count: sql`count(*)::int` })
        .from(schema.departments)
        .where(eq(schema.departments.is_active, true));

      const [presentToday] = await db
        .select({ count: sql`count(*)::int` })
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.attendance_date, today),
            eq(schema.attendance.status, 'present')
          )
        );

      const [onLeave] = await db
        .select({ count: sql`count(*)::int` })
        .from(schema.leaveRequests)
        .where(
          and(
            eq(schema.leaveRequests.status, 'approved'),
            lte(schema.leaveRequests.start_date, today),
            gte(schema.leaveRequests.end_date, today)
          )
        );

      res.json({
        totalEmployees: totalEmployees.count || 0,
        totalDepartments: totalDepartments.count || 0,
        presentToday: presentToday.count || 0,
        onLeave: onLeave.count || 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
