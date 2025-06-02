import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface AuthGuardProps {
  children: React.ReactNode;
  role?: string;
  redirectTo?: string;
}

export function AuthGuard({ children, role, redirectTo = "/login" }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!user) {
    setLocation(redirectTo);
    return null;
  }

  if (role && user.role !== role) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}
