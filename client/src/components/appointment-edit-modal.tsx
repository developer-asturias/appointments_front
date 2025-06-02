import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const editAppointmentSchema = z.object({
  userName: z.string()
    .min(1, "El nombre del usuario no puede estar vacío.")
    .max(50, "El nombre del usuario no puede superar los 50 caracteres."),
  userEmail: z.string()
    .min(1, "El correo electrónico del usuario no puede estar vacío.")
    .email("El correo electrónico debe tener un formato válido."),
  phone: z.string()
    .min(10, "El teléfono debe tener entre 10 y 15 caracteres.")
    .max(15, "El teléfono debe tener entre 10 y 15 caracteres."),
  numberDocument: z.string()
    .min(1, "El número de documento no puede estar vacío."),
  programId: z.string()
    .min(1, "Debe seleccionar un programa."),
  typeOfAppointmentId: z.string()
    .min(1, "Debe seleccionar un tipo de cita."),
  date: z.string()
    .min(1, "La fecha de la cita no puede ser nula."),
  details: z.string()
    .max(200, "Los detalles no pueden superar los 200 caracteres.")
    .optional(),
  status: z.string()
    .min(1, "Debe seleccionar un estado."),
  mentorId: z.string().optional()
});

type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;

interface AppointmentEditModalProps {
  appointment: {
    id: number;
    userName: string;
    userEmail: string;
    phone: string;
    numberDocument: string;
    date: string;
    details?: string;
    status: string;
    mentorId?: number;
    programId: number;
    typeOfAppointmentId: number;
  };
  mentors: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  onClose: () => void;
  onSave: () => void;
}

export function AppointmentEditModal({ appointment, mentors, onClose, onSave }: AppointmentEditModalProps) {
  const [characterCount, setCharacterCount] = useState(appointment.details?.length || 0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      userName: appointment.userName,
      userEmail: appointment.userEmail,
      phone: appointment.phone,
      numberDocument: appointment.numberDocument,
      programId: appointment.programId.toString(),
      typeOfAppointmentId: appointment.typeOfAppointmentId.toString(),
      date: formatDateForInput(appointment.date),
      details: appointment.details || "",
      status: appointment.status,
      mentorId: appointment.mentorId?.toString() || ""
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ["/api/programs"]
  });

  const { data: appointmentTypes = [] } = useQuery({
    queryKey: ["/api/appointment-types"]
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: EditAppointmentFormData) => {
      const updateData = {
        ...data,
        programId: parseInt(data.programId),
        typeOfAppointmentId: parseInt(data.typeOfAppointmentId),
        date: new Date(data.date).toISOString(),
        mentorId: data.mentorId ? parseInt(data.mentorId) : null
      };
      
      const response = await apiRequest("PATCH", `/api/admin/appointments/${appointment.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita actualizada",
        description: "La cita ha sido actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/appointments"] });
      onSave();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleDetailsChange = (value: string) => {
    if (value.length <= 200) {
      setCharacterCount(value.length);
      return value;
    }
    return value.substring(0, 200);
  };

  const onSubmit = (data: EditAppointmentFormData) => {
    updateAppointmentMutation.mutate(data);
  };

  // Set minimum date to today
  const today = new Date();
  const minDateTime = today.toISOString().slice(0, 16);

  const statusOptions = [
    { value: "pending", label: "Pendiente" },
    { value: "assigned", label: "Asignada" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">Editar Cita</CardTitle>
            <p className="text-sm text-gray-600">ID: {appointment.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información del Cliente */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Documento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de cédula o documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="3001234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Información de la Cita */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-lg mb-4">Información de la Cita</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="programId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Programa de Interés *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un programa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(programs) && programs.map((program: any) => (
                              <SelectItem key={program.id} value={program.id.toString()}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeOfAppointmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Cita *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de cita" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(appointmentTypes) && appointmentTypes.map((type: any) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name} ({type.duration} min)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha y Hora *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            min={minDateTime}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mentorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mentor Asignado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un mentor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sin asignar</SelectItem>
                            {mentors.map((mentor) => (
                              <SelectItem key={mentor.id} value={mentor.id.toString()}>
                                {mentor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Detalles */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles Adicionales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe brevemente los temas que te gustaría abordar en la sesión..."
                        rows={4}
                        {...field}
                        onChange={(e) => {
                          field.onChange(handleDetailsChange(e.target.value));
                        }}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-sm text-gray-500">{characterCount}/200 caracteres</span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  disabled={updateAppointmentMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateAppointmentMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}