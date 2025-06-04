import { z } from "zod";

export const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
} as const;

export const STATUS_TEXTS = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
} as const;

export type AppointmentStatus = keyof typeof STATUS_COLORS;

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface Appointment {
  idAppointment: number;
  details: string;
  typeOfAppointmentName: string;
  status: AppointmentStatus;
  date: string;
}

export const searchSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  numberDocument: z.string().min(1, "Número de documento es requerido")
});

export type SearchFormData = z.infer<typeof searchSchema>; 