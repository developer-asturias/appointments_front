import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, User, Mail, Phone, FileText, MapPin, Edit, Trash2, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime, getStatusColor, getStatusText } from "@/lib/utils";
import { AppointmentEditModal } from "./appointment-edit-modal";

interface AppointmentDetailProps {
  appointment: {
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
  userRole?: string;
}

export function AppointmentDetail({ appointment, mentors, onClose, userRole = "admin" }: AppointmentDetailProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/appointments/${appointmentId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      deleteAppointmentMutation.mutate(appointment.appointmentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">Detalle de la Cita</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>
              <span className="text-sm text-gray-500">ID: {appointment.appointmentId}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del Cliente */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="font-medium">{appointment.userName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Documento</label>
                <p className="font-medium">{appointment.numberDocument}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {appointment.userEmail}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {appointment.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Información de la Cita */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Información de la Cita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha y Hora</label>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDateTime(appointment.date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo de Cita</label>
                <p className="font-medium">{appointment.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Programa</label>
                <p className="font-medium">{appointment.program}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Mentor Asignado</label>
                <p className="font-medium">
                  {appointment.mentor || (
                    <span className="text-yellow-600 font-medium">Sin asignar</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles */}
          {appointment.details && (
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Detalles Adicionales
              </h3>
              <p className="text-gray-700 leading-relaxed">{appointment.details}</p>
            </div>
          )}

          {/* Acciones */}
          {userRole === "admin" && (
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => setShowEditModal(true)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Cita
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteAppointmentMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteAppointmentMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      {showEditModal && (
        <AppointmentEditModal
          appointment={appointment}
          mentors={mentors}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}