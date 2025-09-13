import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Mail,
  Save,
  Globe,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailReports: false,
    smsAlerts: true,
    pushNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    debugMode: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system preferences and configurations.</p>
      </div>

      <div className="grid gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Booking Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when new bookings are made
                </p>
              </div>
              <Switch
                checked={notifications.emailBookings}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, emailBookings: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get weekly summary reports via email
                </p>
              </div>
              <Switch
                checked={notifications.emailReports}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, emailReports: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Urgent notifications via SMS
                </p>
              </div>
              <Switch
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, smsAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Browser notifications for real-time updates
                </p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide preferences and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the system in maintenance mode
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={systemSettings.maintenanceMode ? "destructive" : "default"}>
                  {systemSettings.maintenanceMode ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data daily
                </p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) =>
                  setSystemSettings(prev => ({ ...prev, autoBackup: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable detailed logging for troubleshooting
                </p>
              </div>
              <Switch
                checked={systemSettings.debugMode}
                onCheckedChange={(checked) =>
                  setSystemSettings(prev => ({ ...prev, debugMode: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure email settings and templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" type="number" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input id="sender-email" placeholder="noreply@example.com" type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email-template">Booking Confirmation Template</Label>
                <Textarea
                  id="email-template"
                  placeholder="Dear {customer_name}, your booking for {activity} on {date} has been confirmed..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Application Settings
            </CardTitle>
            <CardDescription>
              General application configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="Pelagos Water Sports" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" defaultValue="Asia/Kolkata" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-capacity">Default Max Capacity per Slot</Label>
                <Input id="max-capacity" defaultValue="10" type="number" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="booking-window">Booking Window (days in advance)</Label>
                <Input id="booking-window" defaultValue="30" type="number" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;