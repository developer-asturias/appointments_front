import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertMentorAvailabilitySchema, insertAppointmentScheduleSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend session data type
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      email: string;
      role: string;
      name: string;
    };
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (role: string) => (req: Request, res: Response, next: any) => {
    if (!req.session?.user || req.session.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password || user.role !== role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      res.json({ user: req.session.user });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Public routes
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Search appointments by email and document number
  app.post("/api/appointments/search", async (req, res) => {
    try {
      const { email, numberDocument } = req.body;
      
      if (!email || !numberDocument) {
        return res.status(400).json({ message: "Email y número de documento son requeridos" });
      }

      const appointments = await storage.getAppointments();
      const userAppointments = appointments.filter(appointment => 
        appointment.userEmail.toLowerCase() === email.toLowerCase() && 
        appointment.numberDocument === numberDocument
      );

      // Enrich appointments with program and type information
      const enrichedAppointments = await Promise.all(
        userAppointments.map(async (appointment) => {
          const program = await storage.getProgram(appointment.programId);
          const type = await storage.getAppointmentType(appointment.typeOfAppointmentId);
          const mentor = appointment.mentorId ? await storage.getUser(appointment.mentorId) : null;
          
          return {
            ...appointment,
            program: program?.name,
            type: type?.name,
            mentor: mentor?.name
          };
        })
      );

      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Error al buscar citas" });
    }
  });

  // Cancel appointment by student
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const { email, numberDocument } = req.body;

      if (!email || !numberDocument) {
        return res.status(400).json({ message: "Email y número de documento son requeridos" });
      }

      const appointment = await storage.getAppointment(parseInt(id));
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      // Verify ownership
      if (appointment.userEmail.toLowerCase() !== email.toLowerCase() || 
          appointment.numberDocument !== numberDocument) {
        return res.status(403).json({ message: "No tienes permiso para cancelar esta cita" });
      }

      // Check if appointment can be cancelled (only pending appointments)
      if (appointment.status !== "pending") {
        return res.status(400).json({ message: "Solo se pueden cancelar citas pendientes" });
      }

      const updatedAppointment = await storage.updateAppointment(parseInt(id), { 
        status: "cancelled" 
      });

      res.json({ message: "Cita cancelada exitosamente", appointment: updatedAppointment });
    } catch (error) {
      res.status(500).json({ message: "Error al cancelar la cita" });
    }
  });

  // Update appointment by student
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { email, numberDocument, date, details } = req.body;

      if (!email || !numberDocument) {
        return res.status(400).json({ message: "Email y número de documento son requeridos" });
      }

      const appointment = await storage.getAppointment(parseInt(id));
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      // Verify ownership
      if (appointment.userEmail.toLowerCase() !== email.toLowerCase() || 
          appointment.numberDocument !== numberDocument) {
        return res.status(403).json({ message: "No tienes permiso para editar esta cita" });
      }

      // Check if appointment can be edited (only pending appointments)
      if (appointment.status !== "pending") {
        return res.status(400).json({ message: "Solo se pueden editar citas pendientes" });
      }

      const updates: any = {};
      if (date) updates.date = date;
      if (details !== undefined) updates.details = details;

      const updatedAppointment = await storage.updateAppointment(parseInt(id), updates);

      res.json({ message: "Cita actualizada exitosamente", appointment: updatedAppointment });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la cita" });
    }
  });

  app.get("/api/appointment-types", async (req, res) => {
    try {
      const types = await storage.getAppointmentTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment types" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Protected routes - Admin only
  app.get("/api/admin/appointments", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      
      // Enrich appointments with program and type information
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const program = await storage.getProgram(appointment.programId);
          const type = await storage.getAppointmentType(appointment.typeOfAppointmentId);
          const mentor = appointment.mentorId ? await storage.getUser(appointment.mentorId) : null;
          
          return {
            ...appointment,
            program: program?.name,
            type: type?.name,
            mentor: mentor?.name
          };
        })
      );

      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/admin/mentors", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const mentors = await storage.getUsersByRole("mentor");
      
      // Get appointment counts for each mentor
      const mentorsWithStats = await Promise.all(
        mentors.map(async (mentor) => {
          const appointments = await storage.getAppointmentsByMentor(mentor.id);
          return {
            ...mentor,
            appointmentsCount: appointments.length,
            availability: "Disponible" // This could be more complex based on schedule
          };
        })
      );

      res.json(mentorsWithStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.patch("/api/admin/appointments/:id/assign", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { mentorId } = req.body;

      const updatedAppointment = await storage.updateAppointment(appointmentId, {
        mentorId: mentorId,
        status: "assigned"
      });

      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign mentor" });
    }
  });

  app.patch("/api/admin/appointments/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const updates = req.body;

      const updatedAppointment = await storage.updateAppointment(appointmentId, updates);

      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/admin/appointments/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(appointmentId);

      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Admin appointment schedule management routes
  app.get("/api/admin/appointment-schedules", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const schedules = await storage.getAppointmentSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment schedules" });
    }
  });

  app.post("/api/admin/appointment-schedules", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const scheduleData = insertAppointmentScheduleSchema.parse(req.body);
      const schedule = await storage.createAppointmentSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment schedule" });
    }
  });

  app.patch("/api/admin/appointment-schedules/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const updates = req.body;

      const updatedSchedule = await storage.updateAppointmentSchedule(scheduleId, updates);

      if (!updatedSchedule) {
        return res.status(404).json({ message: "Appointment schedule not found" });
      }

      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment schedule" });
    }
  });

  app.delete("/api/admin/appointment-schedules/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const deleted = await storage.deleteAppointmentSchedule(scheduleId);

      if (!deleted) {
        return res.status(404).json({ message: "Appointment schedule not found" });
      }

      res.json({ message: "Appointment schedule deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment schedule" });
    }
  });

  // Mentor availability routes
  app.get("/api/mentor-availability", async (req, res) => {
    try {
      const availability = await storage.getAllMentorAvailability();
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentor availability" });
    }
  });

  app.get("/api/available-time-slots", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const selectedDate = new Date(date);
      const timeSlots = await storage.getAvailableAppointmentTimes(selectedDate);
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available time slots" });
    }
  });

  // Protected routes - Admin mentor availability management
  app.post("/api/admin/mentor-availability", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const availabilityData = insertMentorAvailabilitySchema.parse(req.body);
      const availability = await storage.createMentorAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create mentor availability" });
    }
  });

  app.get("/api/admin/mentor-availability/:mentorId", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const mentorId = parseInt(req.params.mentorId);
      const availability = await storage.getMentorAvailability(mentorId);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentor availability" });
    }
  });

  // Protected routes - Mentor only
  app.get("/api/mentor/appointments", requireAuth, requireRole("mentor"), async (req, res) => {
    try {
      const mentorId = req.session.user!.id;
      const appointments = await storage.getAppointmentsByMentor(mentorId);
      
      // Enrich appointments with program and type information
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const program = await storage.getProgram(appointment.programId);
          const type = await storage.getAppointmentType(appointment.typeOfAppointmentId);
          
          return {
            ...appointment,
            program: program?.name,
            type: type?.name,
            clientName: appointment.userName,
            clientEmail: appointment.userEmail,
            duration: type?.duration
          };
        })
      );

      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentor appointments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
