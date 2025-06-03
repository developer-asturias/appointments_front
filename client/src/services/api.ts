import { apiRequest } from "@/lib/queryClient";

export interface Program {
  id: number;
  name: string;
  description?: string;
}

export interface AppointmentType {
  id: number;
  name: string;
  description?: string;
}

export const api = {
  programs: {
    getAll: async (): Promise<Program[]> => {
      console.log("Fetching programs...");
      try {
        const response = await fetch("http://localhost:8080/api/programs/get-all", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          const text = await response.text();
          console.error("Error response:", {
            status: response.status,
            statusText: response.statusText,
            body: text,
            headers: Object.fromEntries(response.headers.entries())
          });
          throw new Error(`Error al cargar los programas: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Invalid content type:", contentType);
          console.error("Response body:", text);
          throw new Error("La respuesta no es JSON válido");
        }

        const data = await response.json();
        console.log("Programs response:", data);
        return data;
      } catch (error) {
        console.error("Error fetching programs:", error);
        if (error instanceof TypeError && error.message.includes('CORS')) {
          throw new Error("Error de CORS: No se puede acceder a la API. Verifica la configuración del servidor.");
        }
        throw error;
      }
    }
  },
  appointmentTypes: {
    getAll: async (): Promise<AppointmentType[]> => {
      console.log("Fetching appointment types...");
      try {
        const response = await fetch("http://localhost:8080/api/type-appointment/get-all", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          const text = await response.text();
          console.error("Error response:", {
            status: response.status,
            statusText: response.statusText,
            body: text,
            headers: Object.fromEntries(response.headers.entries())
          });
          throw new Error(`Error al cargar los tipos de cita: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Invalid content type:", contentType);
          console.error("Response body:", text);
          throw new Error("La respuesta no es JSON válido");
        }

        const data = await response.json();
        console.log("Appointment types response:", data);
        return data;
      } catch (error) {
        console.error("Error fetching appointment types:", error);
        if (error instanceof TypeError && error.message.includes('CORS')) {
          throw new Error("Error de CORS: No se puede acceder a la API. Verifica la configuración del servidor.");
        }
        throw error;
      }
    }
  },
  appointments: {
    create: async (data: any) => {
      console.log("Creating appointment with data:", data);
      try {
        const response = await fetch("http://localhost:8080/api/appointments/create", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({
            userName: data.userName,
            userEmail: data.userEmail,
            phone: data.phone,
            programId: parseInt(data.programId),
            numberDocument: data.numberDocument,
            date: new Date(data.date).toISOString(),
            appointmentName: data.appointmentName || "Cita Agendada",
            typeOfAppointmentId: parseInt(data.typeOfAppointmentId),
            details: data.details,
          })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Error response:", {
            status: response.status,
            statusText: response.statusText,
            body: text,
            headers: Object.fromEntries(response.headers.entries())
          });
          throw new Error(`Error al crear la cita: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Invalid content type:", contentType);
          console.error("Response body:", text);
          throw new Error("La respuesta no es JSON válido");
        }

        const result = await response.json();
        console.log("Appointment creation response:", result);
        return result;
      } catch (error) {
        console.error("Error creating appointment:", error);
        if (error instanceof TypeError && error.message.includes('CORS')) {
          throw new Error("Error de CORS: No se puede acceder a la API. Verifica la configuración del servidor.");
        }
        throw error;
      }
    }
  }
}; 