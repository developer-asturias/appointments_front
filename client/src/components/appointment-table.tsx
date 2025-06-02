import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Filter } from "lucide-react";
import { formatDateTime, getStatusColor, getStatusText } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppointmentDetail } from "./appointment-detail";

export function AppointmentTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/admin/appointments"]
  });

  const { data: mentors = [] } = useQuery({
    queryKey: ["/api/admin/mentors"]
  });

  const assignMentorMutation = useMutation({
    mutationFn: async ({ appointmentId, mentorId }: { appointmentId: number; mentorId: number }) => {
      const response = await apiRequest("PATCH", `/api/admin/appointments/${appointmentId}/assign`, { mentorId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      toast({
        title: "Mentor asignado",
        description: "El mentor ha sido asignado exitosamente a la cita.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo asignar el mentor. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      await apiRequest("DELETE", `/api/admin/appointments/${appointmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const filteredAppointments = appointments.filter((appointment: any) => {
    if (statusFilter === "all") return true;
    return appointment.status === statusFilter;
  });

  const handleAssignMentor = (appointmentId: number, mentorId: string) => {
    if (mentorId) {
      assignMentorMutation.mutate({ appointmentId, mentorId: parseInt(mentorId) });
    }
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Citas</h2>
          <p className="text-slate-600 mt-1">Administra y asigna mentores a las citas programadas</p>
        </div>
        
        <div className="flex space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las citas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="assigned">Asignadas</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No hay citas disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment: any) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{appointment.userName}</div>
                        <div className="text-sm text-slate-500">{appointment.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">{appointment.program}</TableCell>
                    <TableCell className="text-sm text-slate-900">{appointment.type}</TableCell>
                    <TableCell className="text-sm text-slate-900">{formatDateTime(appointment.date)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {appointment.mentor ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {appointment.mentor.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-slate-900">{appointment.mentor}</span>
                        </div>
                      ) : (
                        <Select 
                          onValueChange={(value) => handleAssignMentor(appointment.id, value)}
                          disabled={assignMentorMutation.isPending}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Asignar mentor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {mentors.map((mentor: any) => (
                              <SelectItem key={mentor.id} value={mentor.id.toString()}>
                                {mentor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAppointment(appointment)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          disabled={deleteAppointmentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredAppointments.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-slate-700">
                Mostrando <span className="font-medium">1</span> a{" "}
                <span className="font-medium">{Math.min(10, filteredAppointments.length)}</span> de{" "}
                <span className="font-medium">{filteredAppointments.length}</span> citas
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Anterior</Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalle de Cita */}
      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          mentors={mentors}
          onClose={() => setSelectedAppointment(null)}
          userRole="admin"
        />
      )}
    </div>
  );
}
