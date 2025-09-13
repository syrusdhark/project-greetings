import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Shield, 
  Building, 
  Mail, 
  Settings, 
  Calendar,
  MapPin,
  Phone,
  Edit3,
  Activity,
  Award,
  BookOpen,
  Clock,
  Star,
  ChevronRight,
  Camera,
  Bell,
  Lock,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Profile = () => {
  const { user } = useAuth();
  const { profile, school } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration - replace with real data
  const userStats = {
    totalBookings: 12,
    completedActivities: 8,
    favoriteSport: "Surfing",
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    lastActivity: "2 days ago"
  };

  const recentActivities = [
    {
      id: 1,
      type: "booking",
      title: "Surfing Lesson - Goa",
      date: "2 days ago",
      status: "completed",
      icon: BookOpen
    },
    {
      id: 2,
      type: "achievement",
      title: "First Wave Rider Badge",
      date: "1 week ago",
      status: "earned",
      icon: Award
    },
    {
      id: 3,
      type: "booking",
      title: "Paddleboarding - Chennai",
      date: "2 weeks ago",
      status: "completed",
      icon: BookOpen
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'passholder': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'school_partner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <Card className="mb-6 overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(profile?.first_name, profile?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    variant="secondary"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {profile?.first_name && profile?.last_name 
                          ? `${profile.first_name} ${profile.last_name}`
                          : user?.email?.split('@')[0] || 'User'
                        }
                      </h1>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(profile?.role || 'user')}>
                        <Shield className="h-3 w-3 mr-1" />
                        {profile?.role || 'User'}
                      </Badge>
                    </div>
                  </div>
                  {school && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{school.display_name || school.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalBookings}</p>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.completedActivities}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      {profile?.first_name && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">First Name</p>
                            <p className="text-sm text-muted-foreground">{profile.first_name}</p>
                          </div>
                        </div>
                      )}
                      {profile?.last_name && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Last Name</p>
                            <p className="text-sm text-muted-foreground">{profile.last_name}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Member Since</p>
                          <p className="text-sm text-muted-foreground">{userStats.memberSince}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 px-6 text-base">
                      <Edit3 className="h-5 w-5 mr-3" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.role === 'passholder' && (
                      <Link to="/admin/passholder" className="block">
                        <Button variant="outline" className="w-full justify-between h-12 px-6 text-base">
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5" />
                            Passholder Dashboard
                          </div>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                    <Link to="/book-now" className="block">
                      <Button variant="outline" className="w-full justify-between h-12 px-6 text-base">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5" />
                          Book New Activity
                        </div>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-between h-12 px-6 text-base">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between h-12 px-6 text-base">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5" />
                        Help & Support
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="p-2 bg-muted rounded-lg">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                          </div>
                          <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Change Password</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Two-Factor Authentication</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Login History</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive booking updates via email</p>
                      </div>
                      <Button variant="outline" size="sm">On</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive urgent updates via SMS</p>
                      </div>
                      <Button variant="outline" size="sm">Off</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive promotional content</p>
                      </div>
                      <Button variant="outline" size="sm">Off</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    App Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                      </div>
                      <Button variant="outline" size="sm">System</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                      </div>
                      <Button variant="outline" size="sm">English</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Time Zone</p>
                        <p className="text-sm text-muted-foreground">Set your local time zone</p>
                      </div>
                      <Button variant="outline" size="sm">Auto</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;