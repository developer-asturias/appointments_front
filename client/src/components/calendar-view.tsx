import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Video, MoreVertical } from "lucide-react";
import { formatTime, getStatusColor, getStatusText } from "@/lib/utils";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/mentor/appointments"]
  });

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Filter appointments for today
  const today = new Date();
  const todayAppointments = appointments.filter((appointment: any) => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === today.toDateString();
  });

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: number) => {
    const dayDate = new Date(currentYear, currentMonth, day);
    return appointments.filter((appointment: any) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === dayDate.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mi Calendario</h2>
          <p className="text-slate-600 mt-1">Gestiona tus citas y disponibilidad</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 text-sm font-medium text-slate-900 min-w-[140px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Bloquear Tiempo
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {dayNames.map((day) => (
              <div key={day} className="px-4 py-3 text-sm font-medium text-slate-900 text-center bg-slate-50">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayAppointments = day ? getAppointmentsForDay(day) : [];
              const isToday = day && 
                new Date(currentYear, currentMonth, day).toDateString() === today.toDateString();
              
              return (
                <div
                  key={index}
                  className={`border-r border-b border-slate-200 h-32 p-2 hover:bg-slate-50 cursor-pointer ${
                    !day ? 'bg-gray-50' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm mb-1 ${
                        isToday ? 'font-bold text-blue-600' : 'text-slate-600'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((appointment: any, idx: number) => (
                          <div
                            key={idx}
                            className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(appointment.status)}`}
                          >
                            {formatTime(appointment.date)} - {appointment.clientName}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-slate-500 px-2">
                            +{dayAppointments.length - 2} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No tienes citas programadas para hoy
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-slate-900">
                      {formatTime(appointment.date)} - {formatTime(new Date(new Date(appointment.date).getTime() + appointment.duration * 60000))}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{appointment.clientName}</div>
                      <div className="text-sm text-slate-500">
                        {appointment.type} - {appointment.program}
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Video className="mr-1 h-4 w-4" />
                      Unirse
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
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
