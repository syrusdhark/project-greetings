import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
  user_profiles?: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  schools?: {
    name: string;
  } | null;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      
      // Fetch audit logs first
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (auditError) throw auditError;

      if (!auditData || auditData.length === 0) {
        setLogs([]);
        setFilteredLogs([]);
        return;
      }

      // Get unique user IDs and school IDs for batch fetching
      const userIds = [...new Set(auditData.map(log => log.user_id).filter(Boolean))];
      const schoolIds = [...new Set(auditData.map(log => log.school_id).filter(Boolean))];

      // Fetch user profiles and schools in parallel
      const [profilesResult, schoolsResult] = await Promise.all([
        userIds.length > 0 
          ? supabase.from('user_profiles').select('user_id, email, first_name, last_name').in('user_id', userIds)
          : Promise.resolve({ data: [], error: null }),
        schoolIds.length > 0 
          ? supabase.from('schools').select('id, name').in('id', schoolIds)
          : Promise.resolve({ data: [], error: null })
      ]);

      // Create lookup maps
      const profilesMap = new Map(
        (profilesResult.data || []).map(p => [p.user_id, p])
      );
      const schoolsMap = new Map(
        (schoolsResult.data || []).map(s => [s.id, s])
      );

      // Combine the data
      const enrichedLogs = auditData.map(log => ({
        ...log,
        user_profiles: log.user_id ? profilesMap.get(log.user_id) || null : null,
        schools: log.school_id ? schoolsMap.get(log.school_id) || null : null
      }));

      setLogs(enrichedLogs);
      setFilteredLogs(enrichedLogs);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.schools?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Apply resource filter
    if (resourceFilter !== "all") {
      filtered = filtered.filter(log => log.resource_type === resourceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, resourceFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'default';
      case 'update':
      case 'edit':
        return 'secondary';
      case 'delete':
      case 'remove':
        return 'destructive';
      case 'login':
      case 'signin':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueResources = [...new Set(logs.map(log => log.resource_type))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Monitor system activities and user actions</p>
        </div>
        <Button onClick={fetchAuditLogs} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {uniqueResources.map(resource => (
                  <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Audit Trail</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} total logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Resource ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.user_profiles?.email || 'System'}
                            </div>
                            {log.user_profiles?.first_name && (
                              <div className="text-sm text-muted-foreground">
                                {log.user_profiles.first_name} {log.user_profiles.last_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.resource_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.schools?.name || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.resource_id ? log.resource_id.slice(0, 8) + '...' : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}