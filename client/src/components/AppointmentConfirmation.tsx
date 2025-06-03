import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Check,
  CalendarPlus, 
  User, 
  MapPin,
  Mail,
  Shield,
  X
} from "lucide-react";

interface AppointmentData {
  id?: string;
  type?: string;
  datetime: string;
  doctor: {
    name: string;
    specialty?: string;
  };
  location?: {
    name: string;
    address: string;
  };
  userEmail?: string;
}

interface AppointmentConfirmationProps {
  appointment: AppointmentData;
  onAddToCalendar?: () => void;
  onClose?: () => void;
}

export default function AppointmentConfirmation({
  appointment,
  onAddToCalendar,
  onClose
}: AppointmentConfirmationProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleButtonClick = (callback?: () => void) => {
    console.log("Close button clicked, attempting to call callback.", callback);
    if (callback) {
      callback();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-50 ${isKeyboardNavigation ? 'keyboard-navigation' : ''}`}>
      <div className="w-full max-w-md">
        
        {/* Main Confirmation Card */}
        <Card className={`overflow-hidden shadow-xl border-yellow-100 relative ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          
          {/* Close Button */}
          <button
            onClick={() => handleButtonClick(onClose)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-[#FACC51] to-yellow-400 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse-success rounded-full opacity-20"></div>
            
            {/* Animated Success Icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-scale-in">
              <div className="w-12 h-12 relative">
                <Check className="w-12 h-12 text-[#FACC51] animate-check-draw" strokeWidth={3} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2 animate-slide-up">
              ¡Cita Confirmada!
            </h1>
            <p className="text-yellow-100 font-medium animate-slide-up-delay">
              Tu cita ha sido programada exitosamente
            </p>
          </div>
          
          <CardContent className="px-6 py-6 space-y-6">
            
            {/* Appointment Info */}
            <div className="animate-slide-up-delay space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Fecha</h3>
                  <p className="text-sm text-gray-600">{appointment.datetime}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Nombre del Estudiante</h3>
                  <p className="text-sm text-gray-600">{appointment.doctor?.name}</p>
                </div>
              </div>

              {appointment.type && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Tipo de Cita</h3>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
              )}

            </div>
            
            {/* Email Confirmation Notice */}
            {appointment.userEmail && (
              <div className="animate-slide-up-delay-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                      <Mail className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        Confirmación por Email
                      </h4>
                      <p className="text-sm text-yellow-700 leading-relaxed">
                        Recibirás un correo electrónico con todos los detalles de tu cita en <span className="font-semibold">{appointment.userEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {onAddToCalendar && (
              <div className="animate-slide-up-delay-2 space-y-3 pt-2">
                <Button 
                  onClick={() => handleButtonClick(onAddToCalendar)}
                  className="w-full bg-[#FACC51] hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Agregar al Calendario
                </Button>
              </div>
            )}
            
          </CardContent>
                    
        </Card>
      
        {/* Additional Info Card */}
        {appointment.id && (
          <Card className={`mt-6 bg-white/80 backdrop-blur-sm border-white/20 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-gray-600 text-sm">
                  <Shield className="w-4 h-4 text-[#FACC51]" />
                  <span>Confirmación ID: </span>
                  <span className="font-mono font-semibold">{appointment.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  );
} 