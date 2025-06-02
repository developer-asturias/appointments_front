import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { AppointmentTable } from "@/components/appointment-table";
import { ScheduleManagement } from "@/components/schedule-management";
import { ReportsDashboard } from "@/components/reports-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Calendar, Users, BarChart3, LogOut, Plus, Clock } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("appointments");
  const { user, logout } = useAuth();

  const { data: mentors = [] } = useQuery({
    queryKey: ["/api/admin/mentors"]
  });

  const handleLogout = async () => {
    await logout();
  };

  const tabButtons = [
    { id: "appointments", label: "Citas", icon: Calendar },
    { id: "schedules", label: "Horarios", icon: Clock },
    { id: "mentors", label: "Mentores", icon: Users },
    { id: "reports", label: "Reportes", icon: BarChart3 }
  ];

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="text-white h-5 w-5" />
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900">Panel de Administración</h1>
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
                            ? "text-blue-600" 
                            : "text-slate-600 hover:text-blue-600"
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
          {activeTab === "appointments" && <AppointmentTable />}
          
          {activeTab === "schedules" && <ScheduleManagement />}
          
          {activeTab === "mentors" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Gestión de Mentores</h2>
                  <p className="text-slate-600 mt-1">Administra el equipo de mentores y sus especialidades</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Mentor
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor: any) => (
                  <Card key={mentor.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-lg text-white font-medium">
                            {mentor.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{mentor.name}</h3>
                          <p className="text-sm text-slate-500">{mentor.role}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Citas asignadas:</span>
                          <span className="font-medium text-slate-900">{mentor.appointmentsCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Disponibilidad:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {mentor.availability}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Ver Agenda
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && <ReportsDashboard />}
        </main>
      </div>
    </AuthGuard>
  );
}
