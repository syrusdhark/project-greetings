
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Settings, FileText, BarChart3, Calendar, RefreshCw, Home } from "lucide-react";
import { toast } from "sonner";

interface SchoolPartnerLayoutProps {
  children: ReactNode;
}

const SchoolPartnerLayout = ({ children }: SchoolPartnerLayoutProps) => {
  const { profile, school, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/"); // Navigate to home instead of /admin/signin
  };

  const navigationItems = [
    { label: "Live Bookings", icon: BarChart3, href: "/school-partner" },
    { label: "Booking History", icon: Calendar, href: "/school-partner/history" },
    { label: "Reports", icon: FileText, href: "/school-partner/reports" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
              {school?.logo_url && (
                <img 
                  src={school.logo_url} 
                  alt={school.display_name || school.name}
                  className="h-6 w-6 lg:h-8 lg:w-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 className="text-sm lg:text-lg font-bold text-slate-900 truncate">
                  {school?.display_name || school?.name || "School Dashboard"}
                </h1>
                <div className="text-xs text-slate-500 hidden sm:block">
                  Pelagos Partner Portal
                </div>
              </div>
            </div>
            <div className="text-xs lg:text-sm text-slate-600 hidden md:block">
              {currentDate}
            </div>
          </div>

          <div className="flex items-center space-x-1 lg:space-x-4 flex-shrink-0">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link to="/">
                <Home className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Home</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="text-xs lg:text-sm text-slate-600 hidden lg:block">
              {school?.display_name || school?.name}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-16 lg:w-64 min-h-[calc(100vh-4rem)] bg-background border-r border-border">
          <nav className="p-2 lg:p-4 space-y-2">
            <div className="mb-4 p-2 lg:p-3 bg-blue-50 rounded-lg hidden lg:block">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Quick Stats
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-slate-600">
                  Today's Capacity: <span className="font-medium">40 slots</span>
                </div>
                <div className="text-sm text-slate-600">
                  Available: <span className="font-medium text-green-600">12 slots</span>
                </div>
              </div>
            </div>

            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title={item.label}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Help Section - Only show on desktop */}
          <div className="p-4 border-t border-slate-200 hidden lg:block">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Need Help?
              </div>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">
                Contact Support
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 lg:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SchoolPartnerLayout;
