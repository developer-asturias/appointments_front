import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const scheduleSchema = z.object({
  dayOfWeek: z.string().min(1, "Día de la semana es requerido"),
  startTime: z.string().min(1, "Hora de inicio es requerida"),
  endTime: z.string().min(1, "Hora de fin es requerida"),
  isActive: z.string().default("true")
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface Schedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: string;
  createdAt: string;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" }
];

export function ScheduleManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/admin/appointment-schedules"]
  });

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      isActive: "true"
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      return apiRequest("POST", "/api/admin/appointment-schedules", {
        dayOfWeek: parseInt(data.dayOfWeek),
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointment-schedules"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Horario creado",
        description: "El horario ha sido creado exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el horario.",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      if (!editingSchedule) throw new Error("No schedule to update");
      return apiRequest("PATCH", `/api/admin/appointment-schedules/${editingSchedule.id}`, {
        dayOfWeek: parseInt(data.dayOfWeek),
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointment-schedules"] });
      setIsDialogOpen(false);
      setEditingSchedule(null);
      form.reset();
      toast({
        title: "Horario actualizado",
        description: "El horario ha sido actualizado exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el horario.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/appointment-schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointment-schedules"] });
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ScheduleFormData) => {
    if (editingSchedule) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.reset({
      dayOfWeek: schedule.dayOfWeek.toString(),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este horario?")) {
      deleteMutation.mutate(id);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek.toString())?.label || "Desconocido";
  };

  const openCreateDialog = () => {
    setEditingSchedule(null);
    form.reset({
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      isActive: "true"
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">Cargando horarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Horarios</h2>
          <p className="text-slate-600">Configura las franjas horarias disponibles para agendar citas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Horario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Editar Horario" : "Crear Nuevo Horario"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día de la Semana</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un día" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Inicio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingSchedule ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horarios Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No hay horarios configurados. Crea uno nuevo para comenzar.
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule: Schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{getDayName(schedule.dayOfWeek)}</p>
                      <p className="text-sm text-slate-600">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                    <Badge variant={schedule.isActive === "true" ? "default" : "secondary"}>
                      {schedule.isActive === "true" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}