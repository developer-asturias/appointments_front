import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CalendarPlus, CheckCircle } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentData } from "@/hooks/use-appointment-data";
import AppointmentConfirmation from "@/components/AppointmentConfirmation";

const appointmentSchema = z.object({
  userName: z.string()
    .min(1, "El nombre del usuario no puede estar vacío.")
    .max(50, "El nombre del usuario no puede superar los 50 caracteres."),
  userEmail: z.string()
    .min(1, "El correo electrónico del usuario no puede estar vacío.")
    .email("El correo electrónico debe tener un formato válido.")
    .endsWith("@asturias.edu.co", { message: "El correo electrónico debe ser del dominio @asturias.edu.co" }),
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
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: "Debe aceptar el tratamiento de datos personales."
  })
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

// Define the type for the success response data
interface CreateAppointmentSuccessResponse {
  date: string;
  nameStudent: string;
  userEmail: string;
}

export function AppointmentForm() {
  const [characterCount, setCharacterCount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAppointmentData, setSuccessAppointmentData] = useState<CreateAppointmentSuccessResponse | null>(null); // State to store success data
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { programs, appointmentTypes, isLoading } = useAppointmentData();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      phone: "",
      numberDocument: "",
      programId: "",
      typeOfAppointmentId: "",
      date: "",
      details: "",
      dataProcessingConsent: false
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: api.appointments.create,
    onSuccess: (data: CreateAppointmentSuccessResponse) => {
      setSuccessAppointmentData(data);
      setShowSuccessModal(true);
      form.reset();
      setCharacterCount(0);
    },
    onError: (error: any) => {
      toast({
        title: "Error al agendar la cita",
        description: error.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AppointmentFormData) => {
    createAppointmentMutation.mutate(data);
  };

  const handleDetailsChange = (value: string) => {
    setCharacterCount(value.length);
    return value;
  };

  // Set minimum date to today
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDateTime = today.toISOString().slice(0, 16);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl border border-slate-200">
        <CardHeader className="text-white" style={{ backgroundColor: '#FACC15' }}>
          <CardTitle className="text-2xl font-semibold">Cargando...</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("Current programs:", programs);
  console.log("Current appointment types:", appointmentTypes);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border border-slate-200">
      <CardHeader className="text-white" style={{ backgroundColor: '#FACC15' }}>
        <CardTitle className="text-2xl font-semibold">Agendar Cita</CardTitle>
        <p className="text-yellow-100 mt-2">Completa todos los campos para agendar tu sesión</p>
      </CardHeader>

      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
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
                    <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@asturias.edu.co" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="+57 300 123 4567" {...field} />
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
                    <FormLabel>Número de Documento <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="programId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programa <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un programa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs && programs.length > 0 ? (
                          programs.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-programs" disabled>
                            No hay programas disponibles
                          </SelectItem>
                        )}
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
                    <FormLabel>Tipo de Cita <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de cita" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="datetime-local" min={minDateTime} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <span className="text-sm text-slate-500">{characterCount}/200 caracteres</span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataProcessingConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Acepto el tratamiento de mis datos personales para el procesamiento de esta cita de mentoría, de acuerdo con la política de privacidad de la plataforma.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full text-white bg-[#FACC15] hover:bg-[#E6B812] disabled:opacity-50"
                disabled={createAppointmentMutation.isPending}
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                {createAppointmentMutation.isPending ? "Agendando..." : "Agendar Cita"}
              </Button>
            </div>  
          </form>
        </Form>
      </CardContent>

      
      {/* Success Modal */}
      {successAppointmentData && showSuccessModal && (
        <AppointmentConfirmation 
          appointment={{
            id: "",
            type: "",
            datetime: successAppointmentData.date,
            doctor: {
              name: successAppointmentData.nameStudent,
              specialty: "",
            },
            location: {
              name: "",
              address: "",
            },
            userEmail: successAppointmentData.userEmail,
          }}
          onClose={() => setShowSuccessModal(false)}
          onAddToCalendar={() => { console.log("Add to calendar button clicked!"); }}
        />
      )}

    </Card>
  );
}
