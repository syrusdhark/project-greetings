import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { LocationPrompt } from "@/components/location/LocationPrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import Home from "./pages/Home";
import BookNow from "./pages/BookNow";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Deposit from "./pages/Deposit";
import SchoolResults from "./pages/SchoolResults";


import BookingsHistory from "./pages/admin/BookingsHistory";
import ExportReports from "./pages/admin/ExportReports";
import Schools from "./pages/admin/Schools";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import AuditLogs from "./pages/admin/AuditLogs";
import SportSelectionTest from "./components/SportSelectionTest";

// Admin interfaces
import SchoolPartnerLayout from "./components/admin/SchoolPartnerLayout";
import SchoolPartnerDashboard from "./pages/admin/SchoolPartnerDashboard";
import PassholderDashboard from "./pages/admin/PassholderDashboard";
import PaymentsVerify from "./pages/admin/PaymentsVerify";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  useScrollToTop();
  return (
    <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/book-now" element={<BookNow />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/schools" element={<SchoolResults />} />
              <Route path="/explore" element={<SchoolResults />} />
              <Route path="/test-sports" element={<SportSelectionTest />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/deposit/:bookingId" element={
                <ProtectedRoute>
                  <Deposit />
                </ProtectedRoute>
              } />
              
              {/* Passholder Dashboard Route */}
              <Route 
                path="/admin/passholder" 
                element={
                  <AdminProtectedRoute requireAdmin>
                    <PassholderDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payments-verify" 
                element={
                  <AdminProtectedRoute requireAdmin>
                    <PaymentsVerify />
                  </AdminProtectedRoute>
                } 
              />

              {/* School Partner Routes */}
              <Route 
                path="/school-partner" 
                element={
                  <AdminProtectedRoute>
                    <SchoolPartnerLayout>
                      <SchoolPartnerDashboard />
                    </SchoolPartnerLayout>
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/school-partner/history" 
                element={
                  <AdminProtectedRoute>
                    <SchoolPartnerLayout>
                      <BookingsHistory />
                    </SchoolPartnerLayout>
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/school-partner/reports" 
                element={
                  <AdminProtectedRoute>
                    <SchoolPartnerLayout>
                      <ExportReports />
                    </SchoolPartnerLayout>
                  </AdminProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <LocationProvider>
              <LocationPrompt>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </LocationPrompt>
            </LocationProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
