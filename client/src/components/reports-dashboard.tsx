import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Appointment {
  id: number;
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
  mentorId?: number;
  programId: number;
  typeOfAppointmentId: number;
}

interface Mentor {
  id: number;
  name: string;
  email: string;
  role: string;
  appointmentsCount: number;
  availability: string;
}

export function ReportsDashboard() {
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/admin/appointments"]
  });

  const { data: mentors = [], isLoading: mentorsLoading } = useQuery<Mentor[]>({
    queryKey: ["/api/admin/mentors"]
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery<any[]>({
    queryKey: ["/api/programs"]
  });

  const { data: appointmentTypes = [], isLoading: typesLoading } = useQuery<any[]>({
    queryKey: ["/api/appointment-types"]
  });

  const isLoading = appointmentsLoading || mentorsLoading || programsLoading || typesLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">Cargando reportes...</div>;
  }

  // Calcular estadísticas
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(apt => apt.status === "pending").length;
  const assignedAppointments = appointments.filter(apt => apt.status === "assigned").length;
  const completedAppointments = appointments.filter(apt => apt.status === "completed").length;
  const cancelledAppointments = appointments.filter(apt => apt.status === "cancelled").length;

  // Estadísticas por mentor
  const mentorStats = mentors.map(mentor => {
    const mentorAppointments = appointments.filter(apt => apt.mentorId === mentor.id);
    const completed = mentorAppointments.filter(apt => apt.status === "completed").length;
    const assigned = mentorAppointments.filter(apt => apt.status === "assigned").length;
    
    return {
      ...mentor,
      totalAppointments: mentorAppointments.length,
      completedAppointments: completed,
      assignedAppointments: assigned,
      completionRate: mentorAppointments.length > 0 ? Math.round((completed / mentorAppointments.length) * 100) : 0
    };
  });

  // Estadísticas por programa
  const programStats = programs.map((program: any) => {
    const programAppointments = appointments.filter(apt => apt.programId === program.id);
    return {
      ...program,
      appointmentsCount: programAppointments.length,
      percentage: totalAppointments > 0 ? Math.round((programAppointments.length / totalAppointments) * 100) : 0
    };
  });

  // Estadísticas por tipo de cita
  const typeStats = appointmentTypes.map((type: any) => {
    const typeAppointments = appointments.filter(apt => apt.typeOfAppointmentId === type.id);
    return {
      ...type,
      appointmentsCount: typeAppointments.length,
      percentage: totalAppointments > 0 ? Math.round((typeAppointments.length / totalAppointments) * 100) : 0
    };
  });

  // Citas recientes
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "assigned": return "Asignada";
      case "completed": return "Completada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reportes y Estadísticas</h2>
        <p className="text-slate-600 mt-1">Análisis completo del sistema de citas</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Citas</p>
                <p className="text-2xl font-bold text-slate-900">{totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAppointments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{completedAppointments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Mentores Activos</p>
                <p className="text-2xl font-bold text-blue-600">{mentors.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento por Mentor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Rendimiento por Mentor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentorStats.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{mentor.name}</p>
                    <p className="text-sm text-slate-600">
                      {mentor.totalAppointments} citas totales
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{mentor.completionRate}%</p>
                    <p className="text-sm text-slate-600">completadas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Programa */}
        <Card>
          <CardHeader>
            <CardTitle>Citas por Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programStats.map((program: any) => (
                <div key={program.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{program.name}</span>
                    <span className="text-sm text-slate-600">
                      {program.appointmentsCount} ({program.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${program.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Cita Más Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Cita Más Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {typeStats
                .sort((a: any, b: any) => b.appointmentsCount - a.appointmentsCount)
                .map((type: any) => (
                <div key={type.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-slate-600">{type.duration} minutos</p>
                  </div>
                  <Badge variant="secondary">
                    {type.appointmentsCount} citas
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Citas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Citas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.userName}</p>
                    <p className="text-sm text-slate-600">{formatDate(appointment.date)}</p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Estados */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estados de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{pendingAppointments}</p>
              <p className="text-sm text-slate-600">Pendientes</p>
              <p className="text-xs text-slate-500">
                {totalAppointments > 0 ? Math.round((pendingAppointments / totalAppointments) * 100) : 0}% del total
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{assignedAppointments}</p>
              <p className="text-sm text-slate-600">Asignadas</p>
              <p className="text-xs text-slate-500">
                {totalAppointments > 0 ? Math.round((assignedAppointments / totalAppointments) * 100) : 0}% del total
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedAppointments}</p>
              <p className="text-sm text-slate-600">Completadas</p>
              <p className="text-xs text-slate-500">
                {totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}% del total
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">{cancelledAppointments}</p>
              <p className="text-sm text-slate-600">Canceladas</p>
              <p className="text-xs text-slate-500">
                {totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0}% del total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}