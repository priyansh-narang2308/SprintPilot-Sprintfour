import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster as Sonner } from "./components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import SignUpPage from "./pages/signup-page";
import OnBoardingPage from "./pages/onboarding-page";
import Dashboard from "./pages/dashboard-page";
import PRDBuilderPage from "./pages/prd-builder";
import PersonasPage from "./pages/persona-page";
import JourneyMapsPage from "./pages/journey-maps-page";
import WireFramesPage from "./pages/wireframes-page";
import RoadMapsPage from "./pages/roadmaps-page";
import CompetitiveAnalysisPage from "./pages/competitive-analysis-page";
import BacklogPage from "./pages/backlog-page";
import Settings from "./pages/settings-page";
import NotFound from "./pages/not-found";
import ForgotPasswordPage from "./pages/forgot-password-page";
import ResetPasswordPage from "./pages/reset-password-page";
import AuthCallback from "./pages/auth-callback";
import RequireNoAuth from "./components/RequireNoAuth";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <RequireNoAuth>
                    <LoginPage />
                  </RequireNoAuth>
                }
              />
              <Route
                path="/signup"
                element={
                  <RequireNoAuth>
                    <SignUpPage />
                  </RequireNoAuth>
                }
              />
              <Route path="/onboarding" element={<OnBoardingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/prd" element={<PRDBuilderPage />} />
              <Route path="/dashboard/personas" element={<PersonasPage />} />
              <Route path="/dashboard/journeys" element={<JourneyMapsPage />} />
              <Route
                path="/dashboard/wireframes"
                element={<WireFramesPage />}
              />
              <Route path="/dashboard/roadmaps" element={<RoadMapsPage />} />
              <Route
                path="/dashboard/competitive"
                element={<CompetitiveAnalysisPage />}
              />
              <Route path="/dashboard/backlog" element={<BacklogPage />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
