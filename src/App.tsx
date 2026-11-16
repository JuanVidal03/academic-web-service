import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/protected-route";
import { Toaster } from "@/components/ui/sonner";
import { useBootstrapSession } from "@/hooks/use-auth";

const Login = lazy(() => import("@/pages/login/Index"));
const Dashboard = lazy(() => import("@/pages/dashboard/Index"));
const Prediction = lazy(() => import("@/pages/prediction/Index"));
const Batch = lazy(() => import("@/pages/batch/Index"));
const Model = lazy(() => import("@/pages/model/Index"));
const History = lazy(() => import("@/pages/history/Index"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isBootstrapped } = useBootstrapSession();

  if (!isBootstrapped) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Verificando sesión...
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate>
          <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/prediccion" element={<Prediction />} />
                <Route path="/prediccion/lote" element={<Batch />} />
                <Route path="/modelo" element={<Model />} />
              </Route>
              {/* The API answers 403 for an adviser; the guard keeps them from even
                  reaching a page that would only show an error. */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/historial" element={<History />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthGate>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
