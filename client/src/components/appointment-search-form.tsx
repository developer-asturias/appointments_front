import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search } from "lucide-react";
import { searchSchema, type SearchFormData } from "@/lib/constants";

interface AppointmentSearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  isPending: boolean;
}

export const AppointmentSearchForm = memo(function AppointmentSearchForm({
  onSubmit,
  isPending
}: AppointmentSearchFormProps) {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      email: "",
      numberDocument: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="tucorreo@asturias.edu.co" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input  
                    placeholder="12345678" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full text-white bg-[#FACC15] hover:bg-[#E6B812] disabled:opacity-50"   
          disabled={isPending}
        >
          <Search className="mr-2 h-4 w-4" />
          {isPending ? "Buscando..." : "Buscar Citas"}
        </Button>
      </form>
    </Form>
  );
}); 