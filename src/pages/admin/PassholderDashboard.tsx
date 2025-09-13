import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { CalendarDays, Users, FileText, Settings as SettingsIcon, Building2, History, Shield, Download, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import existing admin components
import AdminDashboard from './AdminDashboard';
import BookingsHistory from './BookingsHistory';
import ExportReports from './ExportReports';
import Schools from './Schools';
import UsersPage from './Users';
import AuditLogs from './AuditLogs';
import SettingsPage from './Settings';
import LiveBookings from '@/components/admin/LiveBookings';

const PassholderDashboard = () => {
  const { profile } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: CalendarDays,
      component: AdminDashboard,
      description: 'Overview of bookings and statistics'
    },
    {
      id: 'live',
      label: 'Live Bookings',
      icon: CalendarDays,
      component: () => <LiveBookings />,
      description: 'Real-time booking monitoring'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: History,
      component: BookingsHistory,
      description: 'View and manage all bookings'
    },
    {
      id: 'schools',
      label: 'Schools',
      icon: Building2,
      component: Schools,
      description: 'Manage schools and partners'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      component: UsersPage,
      description: 'User management and roles'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: Download,
      component: ExportReports,
      description: 'Export data and analytics'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: Shield,
      component: AuditLogs,
      description: 'System activity and security logs'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      component: SettingsPage,
      description: 'System configuration and preferences'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminDashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Passholder Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Welcome back, <span className="font-semibold text-primary">{profile?.first_name || 'Passholder'}</span>! Manage all aspects of the platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 h-11 px-6 hover:bg-primary/10 hover:border-primary/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
            <Badge variant="secondary" className="bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">
              <Shield className="w-4 h-4 mr-2" />
              Passholder Access
            </Badge>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1 bg-gradient-to-r from-muted/30 to-muted/50 p-1 rounded-lg border shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-3 h-12 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 hover:bg-muted/50 rounded-md"
                >
                  <Icon className="w-4 h-4 text-muted-foreground data-[state=active]:text-primary" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Enhanced Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {tabs.slice(0, 4).map((tab) => {
              const Icon = tab.icon;
              return (
                <Card 
                  key={tab.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-102 ${
                    activeTab === tab.id 
                      ? 'ring-2 ring-primary shadow-md scale-102 bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm font-semibold">{tab.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs leading-relaxed">
                      {tab.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tab Content */}
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <div className="bg-background rounded-lg border shadow-sm">
                <tab.component />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PassholderDashboard;