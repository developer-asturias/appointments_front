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

interface User {
  id: number;
  name: string;
  email: string;
}

interface Appointment {
  appointmentId: number;
  userName: string;
  userEmail: string;
  phone: string;
  numberDocument: string;
  date: string;
  details?: string;
  status: string;
  program?: string;
  type?: string;
  mentor?: string;
  mentorName?: string | null;
  mentorId?: number;
  programId: number;
  typeOfAppointmentId: number;
}

interface AppointmentsResponse {
  content: Appointment[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export function AppointmentTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users/get-all"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/api/users/get-all");
      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }
      return response.json();
    }
  });

  const { data: appointmentsData, isLoading } = useQuery<AppointmentsResponse>({
    queryKey: ["/api/appointments/get-all"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/api/appointments/get-all");
      if (!response.ok) {
        throw new Error("Error al cargar las citas");
      }
      const data = await response.json();
      return {
        ...data,
        content: data.content.map((appointment: any) => ({
          appointmentId: appointment.appointmentId,
          userName: appointment.userName,
          userEmail: appointment.email,
          phone: appointment.phone || "",
          numberDocument: appointment.numberDocument || "",
          date: appointment.date,
          details: appointment.details,
          status: appointment.status,
          program: appointment.program,
          type: appointment.typeOfAppointmentName,
          mentorName: appointment.mentorName,
          mentorId: appointment.mentorId,
          programId: appointment.programId,
          typeOfAppointmentId: appointment.typeOfAppointmentId
        }))
      };
    }
  });

  const { data: mentors = [] } = useQuery({
    queryKey: ["/api/admin/mentors"]
  });

  const assignMentorMutation = useMutation({
    mutationFn: async ({ appointmentId, mentorId }: { appointmentId: number; mentorId: number }) => {
      if (typeof appointmentId !== 'number') {
        throw new Error('Appointment ID is missing or invalid.');
      }
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/mentor/${mentorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al asignar el mentor');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/get-all"] });
      toast({
        title: "Mentor asignado",
        description: "El mentor ha sido asignado exitosamente a la cita.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el mentor. Inténtalo de nuevo.",
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

  const filteredAppointments = appointmentsData?.content.filter((appointment) => {
    if (statusFilter === "all" && selectedAdvisor === "all") return true;
    if (statusFilter !== "all" && selectedAdvisor === "all") return appointment.status === statusFilter;
    if (statusFilter === "all" && selectedAdvisor !== "all") return appointment.mentorId === parseInt(selectedAdvisor);
    return appointment.status === statusFilter && appointment.mentorId === parseInt(selectedAdvisor);
  }) || [];

  const handleAssignMentor = (appointmentId: number, mentorId: string) => {
    console.log("Assigning mentor - Appointment ID:", appointmentId, "Mentor ID:", mentorId);
    if (mentorId && mentorId !== "unassigned") {
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
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las citas</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="ASSIGNED">Asignadas</SelectItem>
              <SelectItem value="COMPLETED">Completadas</SelectItem>
              <SelectItem value="CANCELLED">Canceladas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por asesor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los asesores</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                filteredAppointments.map((appointment, index) => (
                  <TableRow key={`${appointment.userName}-${index}`}>
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
                      {appointment.mentorName && appointment.mentorName !== null ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {appointment.mentorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-slate-900">{appointment.mentorName}</span>
                        </div>
                      ) : (
                        <Select 
                          value="unassigned"
                          onValueChange={(value) => handleAssignMentor(appointment.appointmentId, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar mentor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name}
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
                <span className="font-medium">{appointmentsData?.totalElements || 0}</span> citas
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={appointmentsData?.first}>Anterior</Button>
                <Button variant="default" size="sm">{appointmentsData?.number ? appointmentsData.number + 1 : 1}</Button>
                <Button variant="outline" size="sm" disabled={appointmentsData?.last}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          mentors={[]}
          onClose={() => setSelectedAppointment(null)}
          userRole="admin"
        />
      )}
    </div>
  );
}
