import { 
  users, 
  programs, 
  appointmentTypes, 
  appointments,
  mentorAvailability,
  appointmentSchedule,
  type User, 
  type InsertUser,
  type Program,
  type InsertProgram,
  type AppointmentType,
  type InsertAppointmentType,
  type Appointment,
  type InsertAppointment,
  type MentorAvailability,
  type InsertMentorAvailability,
  type AppointmentSchedule,
  type InsertAppointmentSchedule
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;

  // Programs
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;

  // Appointment Types
  getAppointmentTypes(): Promise<AppointmentType[]>;
  getAppointmentType(id: number): Promise<AppointmentType | undefined>;
  createAppointmentType(type: InsertAppointmentType): Promise<AppointmentType>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  getAppointmentsByMentor(mentorId: number): Promise<Appointment[]>;
  deleteAppointment(id: number): Promise<boolean>;

  // Mentor Availability
  getMentorAvailability(mentorId: number): Promise<MentorAvailability[]>;
  getAllMentorAvailability(): Promise<MentorAvailability[]>;
  createMentorAvailability(availability: InsertMentorAvailability): Promise<MentorAvailability>;
  updateMentorAvailability(id: number, updates: Partial<MentorAvailability>): Promise<MentorAvailability | undefined>;
  deleteMentorAvailability(id: number): Promise<boolean>;
  getAvailableTimeSlots(date: Date): Promise<{mentorId: number, timeSlots: string[]}[]>;

  // Appointment Schedule
  getAppointmentSchedules(): Promise<AppointmentSchedule[]>;
  getAppointmentSchedule(id: number): Promise<AppointmentSchedule | undefined>;
  createAppointmentSchedule(schedule: InsertAppointmentSchedule): Promise<AppointmentSchedule>;
  updateAppointmentSchedule(id: number, updates: Partial<AppointmentSchedule>): Promise<AppointmentSchedule | undefined>;
  deleteAppointmentSchedule(id: number): Promise<boolean>;
  getAvailableAppointmentTimes(date: Date): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private programs: Map<number, Program>;
  private appointmentTypes: Map<number, AppointmentType>;
  private appointments: Map<number, Appointment>;
  private mentorAvailabilities: Map<number, MentorAvailability>;
  private appointmentSchedules: Map<number, AppointmentSchedule>;
  private currentUserId: number;
  private currentProgramId: number;
  private currentAppointmentTypeId: number;
  private currentAppointmentId: number;
  private currentAvailabilityId: number;
  private currentScheduleId: number;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.appointmentTypes = new Map();
    this.appointments = new Map();
    this.mentorAvailabilities = new Map();
    this.appointmentSchedules = new Map();
    this.currentUserId = 1;
    this.currentProgramId = 1;
    this.currentAppointmentTypeId = 1;
    this.currentAppointmentId = 1;
    this.currentAvailabilityId = 1;
    this.currentScheduleId = 1;

    // Initialize default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create admin user
    await this.createUser({
      email: "admin@mentorconnect.com",
      password: "admin123",
      role: "admin",
      name: "Admin User"
    });

    // Create mentor users
    await this.createUser({
      email: "carlos@mentorconnect.com",
      password: "mentor123",
      role: "mentor",
      name: "Carlos Ruiz"
    });

    await this.createUser({
      email: "ana@mentorconnect.com",
      password: "mentor123",
      role: "mentor",
      name: "Ana López"
    });

    await this.createUser({
      email: "pedro@mentorconnect.com",
      password: "mentor123",
      role: "mentor",
      name: "Pedro Martín"
    });

    // Create programs
    await this.createProgram({
      name: "Desarrollo Web Full Stack",
      description: "Programa completo de desarrollo web frontend y backend"
    });

    await this.createProgram({
      name: "Data Science & Analytics",
      description: "Análisis de datos y ciencia de datos aplicada"
    });

    await this.createProgram({
      name: "UX/UI Design",
      description: "Diseño de experiencia e interfaz de usuario"
    });

    await this.createProgram({
      name: "Marketing Digital",
      description: "Estrategias de marketing en plataformas digitales"
    });

    await this.createProgram({
      name: "Emprendimiento",
      description: "Desarrollo de habilidades empresariales y startup"
    });

    // Create appointment types
    await this.createAppointmentType({
      name: "Consulta Inicial",
      duration: 30,
      description: "Primera consulta para conocer objetivos"
    });

    await this.createAppointmentType({
      name: "Sesión de Mentoría",
      duration: 60,
      description: "Sesión completa de mentoría personalizada"
    });

    await this.createAppointmentType({
      name: "Revisión de Proyecto",
      duration: 45,
      description: "Revisión y feedback de proyectos en desarrollo"
    });

    await this.createAppointmentType({
      name: "Consulta Express",
      duration: 15,
      description: "Consulta rápida para resolver dudas específicas"
    });

    // Create mentor availability schedules
    // Carlos Ruiz (mentor ID 2) - Desarrollo Web
    await this.createMentorAvailability({
      mentorId: 2,
      dayOfWeek: 1, // Lunes
      startTime: "09:00",
      endTime: "12:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 2,
      dayOfWeek: 1, // Lunes
      startTime: "14:00",
      endTime: "17:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 2,
      dayOfWeek: 3, // Miércoles
      startTime: "10:00",
      endTime: "13:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 2,
      dayOfWeek: 5, // Viernes
      startTime: "09:00",
      endTime: "11:30",
      isActive: "true"
    });

    // Ana López (mentor ID 3) - UX/UI Design
    await this.createMentorAvailability({
      mentorId: 3,
      dayOfWeek: 2, // Martes
      startTime: "08:00",
      endTime: "12:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 3,
      dayOfWeek: 4, // Jueves
      startTime: "13:00",
      endTime: "17:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 3,
      dayOfWeek: 6, // Sábado
      startTime: "09:00",
      endTime: "12:00",
      isActive: "true"
    });

    // Pedro Martín (mentor ID 4) - Data Science
    await this.createMentorAvailability({
      mentorId: 4,
      dayOfWeek: 1, // Lunes
      startTime: "15:00",
      endTime: "18:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 4,
      dayOfWeek: 3, // Miércoles
      startTime: "08:00",
      endTime: "11:00",
      isActive: "true"
    });

    await this.createMentorAvailability({
      mentorId: 4,
      dayOfWeek: 5, // Viernes
      startTime: "14:00",
      endTime: "17:00",
      isActive: "true"
    });

    // Create sample appointments
    const today = new Date();

    await this.createAppointment({
      userId: null,
      userName: "María González",
      userEmail: "maria.gonzalez@email.com",
      phone: "3151234567",
      programId: 1,
      numberDocument: "12345678",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
      typeOfAppointmentId: 1,
      details: "Interesada en iniciar carrera en desarrollo web. Tengo conocimientos básicos de HTML y CSS.",
      status: "assigned",
      mentorId: 2,
      dataProcessingConsent: true
    });

    await this.createAppointment({
      userId: null,
      userName: "Carlos Rodríguez",
      userEmail: "carlos.rodriguez@email.com",
      phone: "3009876543",
      programId: 2,
      numberDocument: "87654321",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 14, 30),
      typeOfAppointmentId: 2,
      details: "Necesito orientación para proyecto de análisis predictivo con Python.",
      status: "assigned",
      mentorId: 4,
      dataProcessingConsent: true
    });

    await this.createAppointment({
      userId: null,
      userName: "Ana Martínez",
      userEmail: "ana.martinez@email.com",
      phone: "3187654321",
      programId: 3,
      numberDocument: "11223344",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
      typeOfAppointmentId: 3,
      details: "Quiero revisión de mi portfolio de diseño UX para aplicar a trabajos.",
      status: "pending",
      mentorId: null,
      dataProcessingConsent: true
    });

    await this.createAppointment({
      userId: null,
      userName: "Luis Hernández",
      userEmail: "luis.hernandez@email.com",
      phone: "3123456789",
      programId: 1,
      numberDocument: "55667788",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 0),
      typeOfAppointmentId: 4,
      details: "Preparación para entrevistas técnicas de JavaScript y React.",
      status: "pending",
      mentorId: null,
      dataProcessingConsent: true
    });

    await this.createAppointment({
      userId: null,
      userName: "Sofía Ramírez",
      userEmail: "sofia.ramirez@email.com",
      phone: "3045678901",
      programId: 4,
      numberDocument: "99887766",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 16, 0),
      typeOfAppointmentId: 2,
      details: "Consulta sobre estrategias de marketing digital para startup tecnológica.",
      status: "completed",
      mentorId: 3,
      dataProcessingConsent: true
    });

    await this.createAppointment({
      userId: null,
      userName: "Diego Vargas",
      userEmail: "diego.vargas@email.com",
      phone: "3167890123",
      programId: 5,
      numberDocument: "33445566",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 15, 30),
      typeOfAppointmentId: 1,
      details: "Primera consulta sobre emprendimiento. Tengo idea de negocio en fintech.",
      status: "pending",
      mentorId: null,
      dataProcessingConsent: true
    });

    // Create default appointment schedules (global hours for appointments)
    // Monday to Friday: 8:00 AM - 6:00 PM
    for (let day = 1; day <= 5; day++) {
      await this.createAppointmentSchedule({
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "18:00",
        isActive: "true"
      });
    }

    // Saturday: 9:00 AM - 1:00 PM
    await this.createAppointmentSchedule({
      dayOfWeek: 6,
      startTime: "09:00",
      endTime: "13:00",
      isActive: "true"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Programs
  async getPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }

  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.currentProgramId++;
    const program: Program = { 
      ...insertProgram, 
      id,
      description: insertProgram.description || null
    };
    this.programs.set(id, program);
    return program;
  }

  // Appointment Types
  async getAppointmentTypes(): Promise<AppointmentType[]> {
    return Array.from(this.appointmentTypes.values());
  }

  async getAppointmentType(id: number): Promise<AppointmentType | undefined> {
    return this.appointmentTypes.get(id);
  }

  async createAppointmentType(insertType: InsertAppointmentType): Promise<AppointmentType> {
    const id = this.currentAppointmentTypeId++;
    const appointmentType: AppointmentType = { 
      ...insertType, 
      id,
      description: insertType.description || null
    };
    this.appointmentTypes.set(id, appointmentType);
    return appointmentType;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      userId: insertAppointment.userId || null,
      details: insertAppointment.details || null,
      status: insertAppointment.status || "pending",
      mentorId: insertAppointment.mentorId || null,
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getAppointmentsByMentor(mentorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.mentorId === mentorId
    );
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Mentor Availability methods
  async getMentorAvailability(mentorId: number): Promise<MentorAvailability[]> {
    return Array.from(this.mentorAvailabilities.values()).filter(
      availability => availability.mentorId === mentorId
    );
  }

  async getAllMentorAvailability(): Promise<MentorAvailability[]> {
    return Array.from(this.mentorAvailabilities.values());
  }

  async createMentorAvailability(insertAvailability: InsertMentorAvailability): Promise<MentorAvailability> {
    const id = this.currentAvailabilityId++;
    const availability: MentorAvailability = { 
      ...insertAvailability, 
      id,
      isActive: insertAvailability.isActive || "true"
    };
    this.mentorAvailabilities.set(id, availability);
    return availability;
  }

  async updateMentorAvailability(id: number, updates: Partial<MentorAvailability>): Promise<MentorAvailability | undefined> {
    const availability = this.mentorAvailabilities.get(id);
    if (!availability) return undefined;

    const updatedAvailability = { ...availability, ...updates };
    this.mentorAvailabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }

  async deleteMentorAvailability(id: number): Promise<boolean> {
    return this.mentorAvailabilities.delete(id);
  }

  async getAvailableTimeSlots(date: Date): Promise<{mentorId: number, timeSlots: string[]}[]> {
    const dayOfWeek = date.getDay();
    const availabilities = Array.from(this.mentorAvailabilities.values()).filter(
      availability => availability.dayOfWeek === dayOfWeek && availability.isActive === "true"
    );

    const mentorSlots: {mentorId: number, timeSlots: string[]}[] = [];
    
    for (const availability of availabilities) {
      const existingMentor = mentorSlots.find(m => m.mentorId === availability.mentorId);
      
      // Generate time slots between start and end time
      const timeSlots = this.generateTimeSlots(availability.startTime, availability.endTime);
      
      if (existingMentor) {
        existingMentor.timeSlots.push(...timeSlots);
      } else {
        mentorSlots.push({
          mentorId: availability.mentorId,
          timeSlots: timeSlots
        });
      }
    }

    return mentorSlots;
  }

  private generateTimeSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
      
      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  }

  // Appointment Schedule methods
  async getAppointmentSchedules(): Promise<AppointmentSchedule[]> {
    return Array.from(this.appointmentSchedules.values());
  }

  async getAppointmentSchedule(id: number): Promise<AppointmentSchedule | undefined> {
    return this.appointmentSchedules.get(id);
  }

  async createAppointmentSchedule(insertSchedule: InsertAppointmentSchedule): Promise<AppointmentSchedule> {
    const id = this.currentScheduleId++;
    const schedule: AppointmentSchedule = { 
      ...insertSchedule, 
      id,
      isActive: insertSchedule.isActive || "true",
      createdAt: new Date()
    };
    this.appointmentSchedules.set(id, schedule);
    return schedule;
  }

  async updateAppointmentSchedule(id: number, updates: Partial<AppointmentSchedule>): Promise<AppointmentSchedule | undefined> {
    const schedule = this.appointmentSchedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...updates };
    this.appointmentSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteAppointmentSchedule(id: number): Promise<boolean> {
    return this.appointmentSchedules.delete(id);
  }

  async getAvailableAppointmentTimes(date: Date): Promise<string[]> {
    const dayOfWeek = date.getDay();
    const schedules = Array.from(this.appointmentSchedules.values())
      .filter(schedule => schedule.dayOfWeek === dayOfWeek && schedule.isActive === "true");

    if (schedules.length === 0) {
      return [];
    }

    const timeSlots: string[] = [];
    
    for (const schedule of schedules) {
      const slots = this.generateTimeSlots(schedule.startTime, schedule.endTime);
      timeSlots.push(...slots);
    }

    // Remove duplicates and sort
    const uniqueSlots = Array.from(new Set(timeSlots));
    uniqueSlots.sort();

    // Filter out past times if it's today
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      return uniqueSlots.filter(slot => slot > currentTime);
    }

    return uniqueSlots;
  }
}

export const storage = new MemStorage();
