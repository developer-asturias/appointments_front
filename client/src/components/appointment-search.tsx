import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, FileText, AlertCircle, CheckCircle, Edit, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { StudentAppointmentEditModal } from "@/components/student-appointment-edit-modal";
import { useToast } from "@/hooks/use-toast";
import { AppointmentSearchForm } from "./appointment-search-form";
import { type Appointment, type SearchFormData, type ApiError, STATUS_COLORS, STATUS_TEXTS } from "@/lib/constants";

export function AppointmentSearch() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchCredentials, setSearchCredentials] = useState<{ email: string; numberDocument: string } | null>(null);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (data: SearchFormData) => {
      const params = new URLSearchParams({
        email: data.email,
        documentNumber: data.numberDocument
      });
      
      const response = await apiRequest(
        "GET", 
        `/api/students/search-appointments?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error("Error al buscar citas");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAppointments(data);
      setHasSearched(true);
      setError(null);
      setSearchCredentials({ 
        email: searchMutation.variables?.email || "", 
        numberDocument: searchMutation.variables?.numberDocument || "" 
      });
    },
    onError: (error: ApiError) => {
      const errorMessage = error.message || "Error al buscar citas. Por favor, verifica tus datos.";
      setError(errorMessage);
      setAppointments([]);
      setHasSearched(true);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await apiRequest("POST", `/api/appointments/${appointmentId}/cancel`, {
        email: searchCredentials?.email,
        numberDocument: searchCredentials?.numberDocument
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita cancelada",
        description: "Tu cita ha sido cancelada exitosamente.",
      });
      if (searchCredentials) {
        searchMutation.mutate(searchCredentials);
      }
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la cita. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchFormData) => {
    searchMutation.mutate(data);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    cancelMutation.mutate(appointmentId);
  };

  const handleEditSave = () => {
    toast({
      title: "Cita actualizada",
      description: "Tu cita ha sido actualizada exitosamente.",
    });
    if (searchCredentials) {
      searchMutation.mutate(searchCredentials);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Buscar Mis Citas</h1>
          <p className="text-slate-600">Ingresa tu correo electrónico y número de documento para ver tus citas programadas</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <AppointmentSearchForm 
              onSubmit={onSubmit}
              isPending={searchMutation.isPending}
            />
          </CardContent>
        </Card>

        {hasSearched && (
          <div>
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron citas</h3>
                  <p className="text-slate-600">No hay citas registradas con los datos proporcionados.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Se encontraron {appointments.length} cita(s)
                  </h2>
                </div>

                {appointments.map((appointment) => (
                  <Card key={appointment.idAppointment} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-slate-900">
                              {formatDateTime(appointment.date)}
                            </span>
                            <Badge className={STATUS_COLORS[appointment.status]}>
                              {STATUS_TEXTS[appointment.status]}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Tipo: {appointment.typeOfAppointmentName}</span>
                            </div>
                          </div>

                          {appointment.details && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-700">
                                <strong>Detalles:</strong> {appointment.details}
                              </p>
                            </div>
                          )}
                        </div>

                        {appointment.status === "PENDING" && (
                          <div className="flex flex-col gap-2 md:ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(appointment)}
                              className="w-full md:w-auto"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full md:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={cancelMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Tu cita programada para el {formatDateTime(appointment.date)} será cancelada.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelAppointment(appointment.idAppointment)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Sí, cancelar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {editingAppointment && searchCredentials && (
          <StudentAppointmentEditModal
            appointment={editingAppointment}
            isOpen={!!editingAppointment}
            onClose={() => setEditingAppointment(null)}
            onSave={handleEditSave}
            userEmail={searchCredentials.email}
            userDocument={searchCredentials.numberDocument}
          />
        )}
      </div>
    </div>
  );
}