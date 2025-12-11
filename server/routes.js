import { createServer } from "http";
import { db } from "./storage.js";
import * as schema from "../shared/schema.js";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
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

  // ========== USERS ROUTES ==========
  app.get("/api/users", async (req, res) => {
    try {
      const users = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role_id: schema.users.role_id,
          created_at: schema.users.created_at,
          updated_at: schema.users.updated_at,
        })
        .from(schema.users)
        .orderBy(schema.users.name);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { password, ...rest } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db.insert(schema.users).values({ ...rest, password: hashedPassword }).returning();
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { password, ...rest } = req.body;
      const updateData = { ...rest, updated_at: new Date() };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      const [user] = await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, parseInt(req.params.id)))
        .returning();
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { password, ...rest } = req.body;
      const updateData = { ...rest, updated_at: new Date() };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      const [user] = await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, parseInt(req.params.id)))
        .returning();
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await db.delete(schema.users).where(eq(schema.users.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
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
          department_id: schema.employees.department_id,
          department_name: schema.departments.name,
          job_title_id: schema.employees.job_title_id,
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

  app.patch("/api/employees/:id", async (req, res) => {
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

  // ========== EMPLOYMENT HISTORY ROUTES ==========
  // Alternate route for frontend compatibility
  app.get("/api/employees/:employeeId/histories", async (req, res) => {
    try {
      const histories = await db
        .select({
          id: schema.employmentHistories.id,
          employee_id: schema.employmentHistories.employee_id,
          department_id: schema.employmentHistories.department_id,
          department: schema.departments.name,
          job_title_id: schema.employmentHistories.job_title_id,
          job_title: schema.jobTitles.name,
          start_date: schema.employmentHistories.start_date,
          end_date: schema.employmentHistories.end_date,
          salary: schema.employmentHistories.salary,
          work_location: schema.employmentHistories.work_location,
          employment_type: schema.employmentHistories.employment_type,
          employment_status: schema.employmentHistories.employment_status,
          report_to: schema.employmentHistories.report_to,
          created_at: schema.employmentHistories.created_at,
        })
        .from(schema.employmentHistories)
        .leftJoin(schema.departments, eq(schema.employmentHistories.department_id, schema.departments.id))
        .leftJoin(schema.jobTitles, eq(schema.employmentHistories.job_title_id, schema.jobTitles.id))
        .where(eq(schema.employmentHistories.employee_id, parseInt(req.params.employeeId)))
        .orderBy(desc(schema.employmentHistories.start_date));

      res.json(histories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees/:employeeId/histories", async (req, res) => {
    try {
      const [history] = await db.insert(schema.employmentHistories).values({
        ...req.body,
        employee_id: parseInt(req.params.employeeId),
      }).returning();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // All employment histories route for EmploymentHistory.vue page
  app.get("/api/employment-histories", async (req, res) => {
    try {
      const { employee_id, department_id } = req.query;
      
      let query = db
        .select({
          id: schema.employmentHistories.id,
          employee_id: schema.employmentHistories.employee_id,
          employee_name: schema.employees.full_name,
          department_id: schema.employmentHistories.department_id,
          department: schema.departments.name,
          job_title_id: schema.employmentHistories.job_title_id,
          job_title: schema.jobTitles.name,
          start_date: schema.employmentHistories.start_date,
          end_date: schema.employmentHistories.end_date,
          salary: schema.employmentHistories.salary,
          work_location: schema.employmentHistories.work_location,
          employment_type: schema.employmentHistories.employment_type,
          employment_status: schema.employmentHistories.employment_status,
          report_to: schema.employmentHistories.report_to,
          created_at: schema.employmentHistories.created_at,
        })
        .from(schema.employmentHistories)
        .leftJoin(schema.employees, eq(schema.employmentHistories.employee_id, schema.employees.id))
        .leftJoin(schema.departments, eq(schema.employmentHistories.department_id, schema.departments.id))
        .leftJoin(schema.jobTitles, eq(schema.employmentHistories.job_title_id, schema.jobTitles.id));

      const conditions = [];
      if (employee_id) {
        conditions.push(eq(schema.employmentHistories.employee_id, parseInt(employee_id)));
      }
      if (department_id) {
        conditions.push(eq(schema.employmentHistories.department_id, parseInt(department_id)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const histories = await query.orderBy(desc(schema.employmentHistories.start_date));
      res.json(histories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/employees/:employeeId/employment-history", async (req, res) => {
    try {
      const histories = await db
        .select({
          id: schema.employmentHistories.id,
          employee_id: schema.employmentHistories.employee_id,
          department_id: schema.employmentHistories.department_id,
          department: schema.departments.name,
          job_title_id: schema.employmentHistories.job_title_id,
          job_title: schema.jobTitles.name,
          start_date: schema.employmentHistories.start_date,
          end_date: schema.employmentHistories.end_date,
          salary: schema.employmentHistories.salary,
          work_location: schema.employmentHistories.work_location,
          employment_type: schema.employmentHistories.employment_type,
          employment_status: schema.employmentHistories.employment_status,
          report_to: schema.employmentHistories.report_to,
          created_at: schema.employmentHistories.created_at,
        })
        .from(schema.employmentHistories)
        .leftJoin(schema.departments, eq(schema.employmentHistories.department_id, schema.departments.id))
        .leftJoin(schema.jobTitles, eq(schema.employmentHistories.job_title_id, schema.jobTitles.id))
        .where(eq(schema.employmentHistories.employee_id, parseInt(req.params.employeeId)))
        .orderBy(desc(schema.employmentHistories.start_date));

      res.json(histories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees/:employeeId/employment-history", async (req, res) => {
    try {
      const [history] = await db.insert(schema.employmentHistories).values({
        ...req.body,
        employee_id: parseInt(req.params.employeeId),
      }).returning();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== EMPLOYEE SALARIES ROUTES ==========
  app.get("/api/employees/:employeeId/salaries", async (req, res) => {
    try {
      const salaries = await db
        .select({
          id: schema.employeeSalaries.id,
          employee_id: schema.employeeSalaries.employee_id,
          salary_component_id: schema.employeeSalaries.salary_component_id,
          component_name: schema.salaryComponents.name,
          type: schema.salaryComponents.type,
          amount: schema.employeeSalaries.amount,
          effective_date: schema.employeeSalaries.effective_date,
          end_date: schema.employeeSalaries.end_date,
        })
        .from(schema.employeeSalaries)
        .leftJoin(schema.salaryComponents, eq(schema.employeeSalaries.salary_component_id, schema.salaryComponents.id))
        .where(eq(schema.employeeSalaries.employee_id, parseInt(req.params.employeeId)))
        .orderBy(desc(schema.employeeSalaries.effective_date));

      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees/:employeeId/salaries", async (req, res) => {
    try {
      const [salary] = await db.insert(schema.employeeSalaries).values({
        ...req.body,
        employee_id: parseInt(req.params.employeeId),
      }).returning();
      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/employees/:employeeId/salaries/:id", async (req, res) => {
    try {
      const [salary] = await db
        .update(schema.employeeSalaries)
        .set({ ...req.body, updated_at: new Date() })
        .where(
          and(
            eq(schema.employeeSalaries.id, parseInt(req.params.id)),
            eq(schema.employeeSalaries.employee_id, parseInt(req.params.employeeId))
          )
        )
        .returning();
      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:employeeId/salaries/:id", async (req, res) => {
    try {
      await db.delete(schema.employeeSalaries).where(
        and(
          eq(schema.employeeSalaries.id, parseInt(req.params.id)),
          eq(schema.employeeSalaries.employee_id, parseInt(req.params.employeeId))
        )
      );
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== LEAVE BALANCES ROUTES ==========
  app.get("/api/employees/:employeeId/leave-balances", async (req, res) => {
    try {
      const balances = await db
        .select({
          id: schema.leaveBalances.id,
          employee_id: schema.leaveBalances.employee_id,
          leave_type_id: schema.leaveBalances.leave_type_id,
          leave_type: schema.leaveTypes.name,
          year: schema.leaveBalances.year,
          total_entitled: schema.leaveBalances.total_entitled,
          used: schema.leaveBalances.used,
          remaining: schema.leaveBalances.remaining,
          carried_over: schema.leaveBalances.carried_over,
        })
        .from(schema.leaveBalances)
        .leftJoin(schema.leaveTypes, eq(schema.leaveBalances.leave_type_id, schema.leaveTypes.id))
        .where(eq(schema.leaveBalances.employee_id, parseInt(req.params.employeeId)));

      res.json(balances);
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

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const [department] = await db
        .select()
        .from(schema.departments)
        .where(eq(schema.departments.id, parseInt(req.params.id)))
        .limit(1);

      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }
      res.json(department);
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

  app.patch("/api/departments/:id", async (req, res) => {
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

  app.patch("/api/roles/:id", async (req, res) => {
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

  // ========== JOB FAMILIES ROUTES ==========
  app.get("/api/job-families", async (req, res) => {
    try {
      const jobFamilies = await db.select().from(schema.jobFamilies).orderBy(schema.jobFamilies.name);
      res.json(jobFamilies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/job-families", async (req, res) => {
    try {
      const [jobFamily] = await db.insert(schema.jobFamilies).values(req.body).returning();
      res.json(jobFamily);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/job-families/:id", async (req, res) => {
    try {
      const [jobFamily] = await db
        .update(schema.jobFamilies)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.jobFamilies.id, parseInt(req.params.id)))
        .returning();

      res.json(jobFamily);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/job-families/:id", async (req, res) => {
    try {
      const [jobFamily] = await db
        .update(schema.jobFamilies)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.jobFamilies.id, parseInt(req.params.id)))
        .returning();

      res.json(jobFamily);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/job-families/:id", async (req, res) => {
    try {
      await db.delete(schema.jobFamilies).where(eq(schema.jobFamilies.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== JOB TITLES ROUTES ==========
  app.get("/api/job-titles", async (req, res) => {
    try {
      const jobTitles = await db
        .select({
          id: schema.jobTitles.id,
          code: schema.jobTitles.code,
          name: schema.jobTitles.name,
          job_level: schema.jobTitles.job_level,
          job_family_id: schema.jobTitles.job_family_id,
          family_name: schema.jobFamilies.name,
          is_active: schema.jobTitles.is_active,
          created_at: schema.jobTitles.created_at,
        })
        .from(schema.jobTitles)
        .leftJoin(schema.jobFamilies, eq(schema.jobTitles.job_family_id, schema.jobFamilies.id))
        .orderBy(schema.jobTitles.name);
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

  app.put("/api/job-titles/:id", async (req, res) => {
    try {
      const [jobTitle] = await db
        .update(schema.jobTitles)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.jobTitles.id, parseInt(req.params.id)))
        .returning();

      res.json(jobTitle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/job-titles/:id", async (req, res) => {
    try {
      const [jobTitle] = await db
        .update(schema.jobTitles)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.jobTitles.id, parseInt(req.params.id)))
        .returning();

      res.json(jobTitle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/job-titles/:id", async (req, res) => {
    try {
      await db.delete(schema.jobTitles).where(eq(schema.jobTitles.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== WORK SHIFTS ROUTES ==========
  app.get("/api/work-shifts", async (req, res) => {
    try {
      const workShifts = await db.select().from(schema.workShifts).orderBy(schema.workShifts.name);
      res.json(workShifts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/work-shifts", async (req, res) => {
    try {
      const [workShift] = await db.insert(schema.workShifts).values(req.body).returning();
      res.json(workShift);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/work-shifts/:id", async (req, res) => {
    try {
      const [workShift] = await db
        .update(schema.workShifts)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.workShifts.id, parseInt(req.params.id)))
        .returning();

      res.json(workShift);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/work-shifts/:id", async (req, res) => {
    try {
      const [workShift] = await db
        .update(schema.workShifts)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.workShifts.id, parseInt(req.params.id)))
        .returning();

      res.json(workShift);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/work-shifts/:id", async (req, res) => {
    try {
      await db.delete(schema.workShifts).where(eq(schema.workShifts.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== WORK SCHEDULES ROUTES ==========
  app.get("/api/work-schedules", async (req, res) => {
    try {
      const { employee_id, from, to } = req.query;
      
      let query = db
        .select({
          id: schema.workSchedules.id,
          employee_id: schema.workSchedules.employee_id,
          employee_name: schema.employees.full_name,
          work_date: schema.workSchedules.work_date,
          shift_id: schema.workSchedules.shift_id,
          shift_name: schema.workShifts.name,
          actual_start_time: schema.workSchedules.actual_start_time,
          actual_end_time: schema.workSchedules.actual_end_time,
          total_hours: schema.workSchedules.total_hours,
          overtime_hours: schema.workSchedules.overtime_hours,
          status: schema.workSchedules.status,
          note: schema.workSchedules.note,
        })
        .from(schema.workSchedules)
        .leftJoin(schema.employees, eq(schema.workSchedules.employee_id, schema.employees.id))
        .leftJoin(schema.workShifts, eq(schema.workSchedules.shift_id, schema.workShifts.id));

      const conditions = [];
      if (employee_id) {
        conditions.push(eq(schema.workSchedules.employee_id, parseInt(employee_id)));
      }
      if (from) {
        conditions.push(gte(schema.workSchedules.work_date, from));
      }
      if (to) {
        conditions.push(lte(schema.workSchedules.work_date, to));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const schedules = await query.orderBy(asc(schema.workSchedules.work_date));
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/work-schedules", async (req, res) => {
    try {
      const { employee_id, work_date } = req.body;
      
      const [existing] = await db
        .select()
        .from(schema.workSchedules)
        .where(
          and(
            eq(schema.workSchedules.employee_id, employee_id),
            eq(schema.workSchedules.work_date, work_date)
          )
        )
        .limit(1);

      if (existing) {
        return res.status(409).json({ error: "Work schedule already exists for this employee and date" });
      }

      const [schedule] = await db.insert(schema.workSchedules).values(req.body).returning();
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/work-schedules/:id", async (req, res) => {
    try {
      const [schedule] = await db
        .update(schema.workSchedules)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.workSchedules.id, parseInt(req.params.id)))
        .returning();

      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/work-schedules/:id", async (req, res) => {
    try {
      const [schedule] = await db
        .update(schema.workSchedules)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.workSchedules.id, parseInt(req.params.id)))
        .returning();

      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/work-schedules/:id", async (req, res) => {
    try {
      await db.delete(schema.workSchedules).where(eq(schema.workSchedules.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== SALARY COMPONENTS ROUTES ==========
  app.get("/api/salary-components", async (req, res) => {
    try {
      const components = await db.select().from(schema.salaryComponents).orderBy(schema.salaryComponents.name);
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/salary-components", async (req, res) => {
    try {
      const [component] = await db.insert(schema.salaryComponents).values(req.body).returning();
      res.json(component);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/salary-components/:id", async (req, res) => {
    try {
      const [component] = await db
        .update(schema.salaryComponents)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.salaryComponents.id, parseInt(req.params.id)))
        .returning();

      res.json(component);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/salary-components/:id", async (req, res) => {
    try {
      const [component] = await db
        .update(schema.salaryComponents)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.salaryComponents.id, parseInt(req.params.id)))
        .returning();

      res.json(component);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/salary-components/:id", async (req, res) => {
    try {
      await db.delete(schema.salaryComponents).where(eq(schema.salaryComponents.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== LEAVE TYPES ROUTES ==========
  app.get("/api/leave-types", async (req, res) => {
    try {
      const leaveTypes = await db.select().from(schema.leaveTypes).orderBy(schema.leaveTypes.name);
      res.json(leaveTypes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/leave-types", async (req, res) => {
    try {
      const [leaveType] = await db.insert(schema.leaveTypes).values(req.body).returning();
      res.json(leaveType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/leave-types/:id", async (req, res) => {
    try {
      const [leaveType] = await db
        .update(schema.leaveTypes)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.leaveTypes.id, parseInt(req.params.id)))
        .returning();

      res.json(leaveType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/leave-types/:id", async (req, res) => {
    try {
      await db.delete(schema.leaveTypes).where(eq(schema.leaveTypes.id, parseInt(req.params.id)));
      res.json({ deleted: parseInt(req.params.id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ATTENDANCE ROUTES ==========
  app.get("/api/attendance", async (req, res) => {
    try {
      const { start_date, end_date, employee_id, from, to } = req.query;
      
      let query = db
        .select({
          id: schema.attendance.id,
          employee_id: schema.attendance.employee_id,
          employee_name: schema.employees.full_name,
          attendance_date: schema.attendance.attendance_date,
          check_in_time: schema.attendance.check_in_time,
          check_out_time: schema.attendance.check_out_time,
          total_work_hours: schema.attendance.total_work_hours,
          late_minutes: schema.attendance.late_minutes,
          early_leave_minutes: schema.attendance.early_leave_minutes,
          overtime_hours: schema.attendance.overtime_hours,
          status: schema.attendance.status,
          notes: schema.attendance.notes,
        })
        .from(schema.attendance)
        .leftJoin(schema.employees, eq(schema.attendance.employee_id, schema.employees.id));

      const conditions = [];
      if (start_date || from) {
        conditions.push(gte(schema.attendance.attendance_date, start_date || from));
      }
      if (end_date || to) {
        conditions.push(lte(schema.attendance.attendance_date, end_date || to));
      }
      if (employee_id) {
        conditions.push(eq(schema.attendance.employee_id, parseInt(employee_id)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const records = await query.orderBy(desc(schema.attendance.attendance_date));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const [record] = await db.insert(schema.attendance).values(req.body).returning();
      res.json(record);
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

  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const [record] = await db
        .update(schema.attendance)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.attendance.id, parseInt(req.params.id)))
        .returning();

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== LEAVES ROUTES ==========
  app.get("/api/leaves", async (req, res) => {
    try {
      const { employee_id, status } = req.query;
      
      let query = db
        .select({
          id: schema.leaveRequests.id,
          employee_id: schema.leaveRequests.employee_id,
          employee_name: schema.employees.full_name,
          leave_type_id: schema.leaveRequests.leave_type_id,
          leave_type: schema.leaveRequests.leave_type,
          start_date: schema.leaveRequests.start_date,
          end_date: schema.leaveRequests.end_date,
          days_count: schema.leaveRequests.days_count,
          total_days: schema.leaveRequests.total_days,
          reason: schema.leaveRequests.reason,
          status: schema.leaveRequests.status,
          approved_by: schema.leaveRequests.approved_by,
          approved_at: schema.leaveRequests.approved_at,
          created_at: schema.leaveRequests.created_at,
        })
        .from(schema.leaveRequests)
        .leftJoin(schema.employees, eq(schema.leaveRequests.employee_id, schema.employees.id));

      const conditions = [];
      if (employee_id) {
        conditions.push(eq(schema.leaveRequests.employee_id, parseInt(employee_id)));
      }
      if (status) {
        conditions.push(eq(schema.leaveRequests.status, status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const requests = await query.orderBy(desc(schema.leaveRequests.created_at));
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/leaves", async (req, res) => {
    try {
      const { start_date, end_date, total_days, ...rest } = req.body;
      let calculatedDays = total_days;
      if (!calculatedDays && start_date && end_date) {
        const diff = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24);
        calculatedDays = diff >= 0 ? diff + 1 : null;
      }
      const [leave] = await db.insert(schema.leaveRequests).values({
        ...rest,
        start_date,
        end_date,
        total_days: calculatedDays,
        days_count: calculatedDays,
      }).returning();
      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/leaves/:id", async (req, res) => {
    try {
      const [leave] = await db
        .update(schema.leaveRequests)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(schema.leaveRequests.id, parseInt(req.params.id)))
        .returning();

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

      const conditions = [];
      if (month) {
        conditions.push(eq(schema.salaries.month, month));
      }
      if (employee_id) {
        conditions.push(eq(schema.salaries.employee_id, parseInt(employee_id)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
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

  // ========== ACTIVITY LOGS ROUTES ==========
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const { by_user_id, user_id, action, table_name, record_id } = req.query;
      
      let query = db
        .select({
          id: schema.activityLogs.id,
          table_name: schema.activityLogs.table_name,
          record_id: schema.activityLogs.record_id,
          action: schema.activityLogs.action,
          by_user_id: schema.activityLogs.by_user_id,
          user_name: schema.users.name,
          at: schema.activityLogs.at,
          old_values: schema.activityLogs.old_values,
          new_values: schema.activityLogs.new_values,
          ip_address: schema.activityLogs.ip_address,
          user_agent: schema.activityLogs.user_agent,
        })
        .from(schema.activityLogs)
        .leftJoin(schema.users, eq(schema.activityLogs.by_user_id, schema.users.id));

      const conditions = [];
      if (by_user_id || user_id) {
        conditions.push(eq(schema.activityLogs.by_user_id, parseInt(by_user_id || user_id)));
      }
      if (action) {
        conditions.push(eq(schema.activityLogs.action, action));
      }
      if (table_name) {
        conditions.push(eq(schema.activityLogs.table_name, table_name));
      }
      if (record_id) {
        conditions.push(eq(schema.activityLogs.record_id, parseInt(record_id)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const logs = await query.orderBy(desc(schema.activityLogs.at));
      res.json(logs);
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
        totalEmployees: totalEmployees?.count || 0,
        totalDepartments: totalDepartments?.count || 0,
        presentToday: presentToday?.count || 0,
        onLeave: onLeave?.count || 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
