import { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart, TrendingUp, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnalyticsReports = () => {
  const { isPassholder } = useAdminAuth();
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Mock analytics data - in real app, this would come from API
  const analyticsData = [
    { metric: 'Total Bookings', value: 152, change: '+12%' },
    { metric: 'Revenue (INR)', value: 45600, change: '+8%' },
    { metric: 'Active Schools', value: 8, change: '+2' },
    { metric: 'Average Booking Value', value: 300, change: '+5%' },
    { metric: 'Customer Satisfaction', value: 4.8, change: '+0.2' },
    { metric: 'Repeat Customers', value: 68, change: '+15%' },
  ];

  const exportAnalytics = async () => {
    setIsExporting(true);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `analytics_${currentDate}.${exportFormat}`;
      
      // Prepare analytics data for export
      const exportData = analyticsData.map(item => ({
        'Metric': item.metric,
        'Value': item.value,
        'Change': item.change,
        'Export Date (UTC)': new Date().toISOString(),
      }));

      if (exportFormat === 'csv') {
        // Create CSV
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => headers.map(header => 
            `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
          ).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // For XLSX, we'd need a library like xlsx - for now, fall back to CSV
        toast({
          variant: "destructive",
          title: "Excel export not available",
          description: "Please use CSV format for now.",
        });
        return;
      }

      toast({
        title: "Export successful",
        description: `Downloaded analytics report as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export analytics. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            View business metrics and performance data
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={exportFormat} onValueChange={(value: 'csv' | 'xlsx') => setExportFormat(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} disabled={isExporting} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Analytics'}</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.metric}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                {index % 4 === 0 && <BarChart />}
                {index % 4 === 1 && <DollarSign />}
                {index % 4 === 2 && <Users />}
                {index % 4 === 3 && <TrendingUp />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.metric.includes('Revenue') ? `₹${item.value.toLocaleString()}` : item.value}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{item.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Surfing</span>
                <span className="font-medium">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kayaking</span>
                <span className="font-medium">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Jet Skiing</span>
                <span className="font-medium">22%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Parasailing</span>
                <span className="font-medium">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Peak Hours</span>
                <span className="font-medium">8 AM - 12 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Best Day</span>
                <span className="font-medium">Saturday</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Avg. Group Size</span>
                <span className="font-medium">3.2 people</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Advance Booking</span>
                <span className="font-medium">2.5 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReports;