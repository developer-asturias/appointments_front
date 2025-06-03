import { useQuery } from "@tanstack/react-query";
import { api, type Program, type AppointmentType } from "@/services/api";

export function useAppointmentData() {
  const { data: programs = [], isLoading: isLoadingPrograms, error: programsError } = useQuery<Program[]>({
    queryKey: ["/api/programs/get-all"],
    queryFn: api.programs.getAll,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 300000 // Data is considered fresh for 5 minutes
  });

  const { data: appointmentTypes = [], isLoading: isLoadingAppointmentTypes, error: appointmentTypesError } = useQuery<AppointmentType[]>({
    queryKey: ["/api/appointment-types"],
    queryFn: api.appointmentTypes.getAll,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 300000 // Data is considered fresh for 5 minutes
  });

  console.log("Hook - Programs:", programs);
  console.log("Hook - Programs Error:", programsError);

  return {
    programs,
    appointmentTypes,
    isLoading: isLoadingPrograms || isLoadingAppointmentTypes,
    error: programsError || appointmentTypesError
  };
} 