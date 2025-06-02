import { pgTable, text, serial, integer, timestamp, bigint, time } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' | 'mentor'
  name: text("name").notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const appointmentTypes = pgTable("appointment_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // in minutes
  description: text("description"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  phone: text("phone").notNull(),
  programId: bigint("program_id", { mode: "number" }).notNull(),
  numberDocument: text("number_document").notNull(),
  date: timestamp("date").notNull(),
  typeOfAppointmentId: bigint("type_of_appointment_id", { mode: "number" }).notNull(),
  details: text("details"),
  status: text("status").notNull().default("pending"), // 'pending' | 'assigned' | 'completed' | 'cancelled'
  mentorId: bigint("mentor_id", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentorAvailability = pgTable("mentor_availability", {
  id: serial("id").primaryKey(),
  mentorId: bigint("mentor_id", { mode: "number" }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isActive: text("is_active").notNull().default("true"), // 'true' | 'false'
});

export const appointmentSchedule = pgTable("appointment_schedule", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isActive: text("is_active").notNull().default("true"), // 'true' | 'false'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
});

export const insertAppointmentTypeSchema = createInsertSchema(appointmentTypes).omit({
  id: true,
});

export const insertMentorAvailabilitySchema = createInsertSchema(mentorAvailability).omit({
  id: true,
});

export const insertAppointmentScheduleSchema = createInsertSchema(appointmentSchedule).omit({
  id: true,
  createdAt: true,
}).extend({
  isActive: z.string().default("true"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
}).extend({
  userName: z.string().min(1, "El nombre del usuario no puede estar vacío.").max(50, "El nombre del usuario no puede superar los 50 caracteres."),
  userEmail: z.string().min(1, "El correo electrónico del usuario no puede estar vacío.").email("El correo electrónico debe tener un formato válido."),
  phone: z.string().min(10, "El teléfono debe tener entre 10 y 15 caracteres.").max(15, "El teléfono debe tener entre 10 y 15 caracteres."),
  numberDocument: z.string().min(1, "El número de documento no puede estar vacío."),
  details: z.string().max(200, "Los detalles no pueden superar los 200 caracteres.").optional(),
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: "Debe aceptar el tratamiento de datos personales."
  }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type AppointmentType = typeof appointmentTypes.$inferSelect;
export type InsertAppointmentType = z.infer<typeof insertAppointmentTypeSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type MentorAvailability = typeof mentorAvailability.$inferSelect;
export type InsertMentorAvailability = z.infer<typeof insertMentorAvailabilitySchema>;
export type AppointmentSchedule = typeof appointmentSchedule.$inferSelect;
export type InsertAppointmentSchedule = z.infer<typeof insertAppointmentScheduleSchema>;
