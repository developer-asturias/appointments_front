import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import { CalendarCheck, LogIn, Search } from "lucide-react";
import { Link } from "wouter";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <CalendarCheck className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Asturias Mentorías</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/search">
                <Button variant="outline" className="text-slate-600 hover:text-blue-600">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Mis Citas
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-yellow-600">
                  <LogIn className="mr-2 h-4 w-4" />
                  Acceso Staff
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Agenda tu Sesión de Mentoría
          </h1>
          {/* <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Conecta con mentores expertos y acelera tu crecimiento profesional. 
            Reserva tu cita de manera rápida y sencilla.
          </p> */}
        </div>

        <AppointmentForm />
      </main>
    </div>
  );
}
