import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const jobLevelEnum = pgEnum('job_level', ['entry', 'junior', 'senior', 'lead', 'manager', 'director', 'executive']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'leave']);

// Users table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role_id: integer("role_id").references(() => roles.id),
  remember_token: text("remember_token"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Roles table
export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  permissions: text("permissions"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  manager_id: integer("manager_id"),
  parent_id: integer("parent_id"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Job Families table
export const jobFamilies = pgTable("job_families", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Job Titles table
export const jobTitles = pgTable("job_titles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  job_level: jobLevelEnum("job_level").notNull(),
  job_family_id: integer("job_family_id").references(() => jobFamilies.id),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Employees table
export const employees = pgTable("employees", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employee_code: varchar("employee_code", { length: 50 }).notNull().unique(),
  first_name: varchar("first_name", { length: 50 }).notNull(),
  last_name: varchar("last_name", { length: 50 }).notNull(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique(),
  phone: varchar("phone", { length: 20 }),
  date_of_birth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  address: text("address"),
  department_id: integer("department_id").references(() => departments.id),
  job_title_id: integer("job_title_id").references(() => jobTitles.id),
  manager_id: integer("manager_id"),
  hire_date: date("hire_date"),
  user_id: integer("user_id").references(() => users.id),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employee_id: integer("employee_id").notNull().references(() => employees.id),
  attendance_date: date("attendance_date").notNull(),
  check_in_time: timestamp("check_in_time"),
  check_out_time: timestamp("check_out_time"),
  status: attendanceStatusEnum("status").default('present'),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Leave Requests table
export const leaveRequests = pgTable("leave_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employee_id: integer("employee_id").notNull().references(() => employees.id),
  leave_type: varchar("leave_type", { length: 50 }).notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  days_count: decimal("days_count", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default('pending'),
  approved_by: integer("approved_by").references(() => employees.id),
  approved_at: timestamp("approved_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Salaries table
export const salaries = pgTable("salaries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employee_id: integer("employee_id").notNull().references(() => employees.id),
  month: varchar("month", { length: 7 }).notNull(),
  base_salary: decimal("base_salary", { precision: 15, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 15, scale: 2 }).default('0'),
  bonuses: decimal("bonuses", { precision: 15, scale: 2 }).default('0'),
  deductions: decimal("deductions", { precision: 15, scale: 2 }).default('0'),
  net_salary: decimal("net_salary", { precision: 15, scale: 2 }).notNull(),
  working_days: integer("working_days").notNull(),
  actual_days: decimal("actual_days", { precision: 5, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true, updated_at: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, created_at: true, updated_at: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, created_at: true, updated_at: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, created_at: true, updated_at: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, created_at: true, updated_at: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, created_at: true, updated_at: true });
export const insertSalarySchema = createInsertSchema(salaries).omit({ id: true, created_at: true, updated_at: true });
export const insertJobTitleSchema = createInsertSchema(jobTitles).omit({ id: true, created_at: true, updated_at: true });
export const insertJobFamilySchema = createInsertSchema(jobFamilies).omit({ id: true, created_at: true, updated_at: true });

// Types (commented out since they're TypeScript constructs)
// export type User = typeof users.$inferSelect;
// export type InsertUser = z.infer<typeof insertUserSchema>;
// ... etc
