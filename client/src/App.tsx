import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

const HomePage = lazy(() => import("./pages/home"));
const AuthPage = lazy(() => import("./pages/auth"));
const ProfilePage = lazy(() => import("./pages/profile"));
const ActivityPage = lazy(() => import("./pages/activity"));
const CenterPage = lazy(() => import("./pages/center"));
const ContactPage = lazy(() => import("./pages/contact"));
const ResetPasswordPage = lazy(() => import("./pages/reset-password"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/activities/:id",
    element: <ActivityPage />,
  },
  {
    path: "/centers/:id",
    element: <CenterPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;