import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { CalendarView } from "@/components/calendar-view";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, Calendar, List, User, LogOut, Video, MessageCircle } from "lucide-react";
import { formatDateTime, getStatusColor, getStatusText } from "@/lib/utils";

export default function MentorPage() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [timeFilter, setTimeFilter] = useState("this-week");
  const { user, logout } = useAuth();

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/mentor/appointments"]
  });

  const handleLogout = async () => {
    await logout();
  };

  const filteredAppointments = appointments.filter((appointment: any) => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    
    switch (timeFilter) {
      case "this-week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
      case "this-month":
        return appointmentDate.getMonth() === now.getMonth() && appointmentDate.getFullYear() === now.getFullYear();
      case "upcoming":
        return appointmentDate > now;
      case "completed":
        return appointment.status === "completed";
      default:
        return true;
    }
  });

  const tabButtons = [
    { id: "calendar", label: "Mi Calendario", icon: Calendar },
    { id: "appointments", label: "Mis Citas", icon: List },
    { id: "profile", label: "Perfil", icon: User }
  ];

  return (
    <AuthGuard role="mentor">
      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white h-5 w-5" />
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900">Panel de Mentor</h1>
                </div>
                
                <div className="hidden md:flex space-x-6">
                  {tabButtons.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center font-medium transition-colors ${
                          activeTab === tab.id 
                            ? "text-indigo-600" 
                            : "text-slate-600 hover:text-indigo-600"
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">{user?.name}</span>
                <Button variant="ghost" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "calendar" && <CalendarView />}
          
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Mis Citas</h2>
                  <p className="text-slate-600 mt-1">Historial y gestión de todas tus sesiones</p>
                </div>
                
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">Esta semana</SelectItem>
                    <SelectItem value="this-month">Este mes</SelectItem>
                    <SelectItem value="upcoming">Próximas</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Programa</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No hay citas para el período seleccionado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((appointment: any) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-slate-900">{appointment.clientName}</div>
                                <div className="text-sm text-slate-500">{appointment.clientEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-900">{appointment.program}</TableCell>
                            <TableCell className="text-sm text-slate-900">{formatDateTime(appointment.date)}</TableCell>
                            <TableCell className="text-sm text-slate-900">{appointment.duration} minutos</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Video className="mr-1 h-4 w-4" />
                                  Unirse
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Mi Perfil</h2>
                <p className="text-slate-600 mt-1">Información personal y configuración</p>
              </div>
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500">Funcionalidad de perfil en desarrollo</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
