import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDateTime } from "@/lib/utils";
import { type Appointment } from "@/lib/constants";

const editAppointmentSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  details: z.string().optional()
});

type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;

interface StudentAppointmentEditModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  userEmail: string;
  userDocument: string;
}

export function StudentAppointmentEditModal({
  appointment,
  isOpen,
  onClose,
  onSave,
  userEmail,
  userDocument
}: StudentAppointmentEditModalProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      date: appointment.date.slice(0, 16), // Format for datetime-local input
      details: appointment.details || ""
    }
  });

  const editMutation = useMutation({
    mutationFn: async (data: EditAppointmentFormData) => {
      const response = await apiRequest("PATCH", `/api/appointments/${appointment.id}`, {
        ...data,
        email: userEmail,
        numberDocument: userDocument
      });
      return response.json();
    },
    onSuccess: () => {
      onSave();
      onClose();
      setError(null);
    },
    onError: (error: any) => {
      setError("Error al actualizar la cita. Por favor, intenta nuevamente.");
    },
  });

  const onSubmit = (data: EditAppointmentFormData) => {
    setError(null);
    editMutation.mutate(data);
  };

  // Set minimum date to current date
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editar Cita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Programa:</strong> {appointment.program}
            </p>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Tipo:</strong> {appointment.type}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Fecha actual:</strong> {formatDateTime(appointment.date)}
            </p>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Nueva Fecha y Hora
                    </FormLabel>
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
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles Adicionales (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agrega cualquier información adicional sobre tu cita..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={editMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}