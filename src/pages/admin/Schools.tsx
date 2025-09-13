import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Building2, Users, Mail, Phone, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Schools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSchool, setEditingSchool] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "",
    display_name: "",
    email: "",
    phone: "",
    max_capacity_per_slot: 10,
    is_active: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.display_name && school.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewBookings = (schoolId: string) => {
    navigate(`/admin/bookings?school=${schoolId}`);
  };

  const handleEditSchool = (school: any) => {
    setEditingSchool(school);
    setIsEditDialogOpen(true);
  };

  const addSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({
        title: "School added",
        description: "New school has been successfully created.",
      });
      setIsAddDialogOpen(false);
      setNewSchool({
        name: "",
        display_name: "",
        email: "",
        phone: "",
        max_capacity_per_slot: 10,
        is_active: true
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create school.",
        variant: "destructive",
      });
    }
  });

  const handleAddSchool = () => {
    if (!newSchool.name.trim()) {
      toast({
        title: "Error",
        description: "School name is required.",
        variant: "destructive",
      });
      return;
    }
    addSchoolMutation.mutate(newSchool);
  };

  const handleSaveSchool = async () => {
    if (!editingSchool) return;

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          display_name: editingSchool.display_name,
          email: editingSchool.email,
          phone: editingSchool.phone,
          max_capacity_per_slot: editingSchool.max_capacity_per_slot,
          is_active: editingSchool.is_active,
        })
        .eq('id', editingSchool.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({
        title: "School updated",
        description: "School details have been successfully updated.",
      });

      setIsEditDialogOpen(false);
      setEditingSchool(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update school details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground">Manage partner schools and their settings.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search schools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {school.display_name || school.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={school.is_active ? "default" : "secondary"}>
                    {school.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {school.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{school.email}</span>
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{school.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Max Capacity: {school.max_capacity_per_slot || 10} per slot</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditSchool(school)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewBookings(school.id)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSchools.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchTerm ? "No schools match your search criteria." : "Get started by adding your first partner school."}
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add School
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
          </DialogHeader>
          {editingSchool && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="display_name" className="text-right">
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  value={editingSchool.display_name || ""}
                  onChange={(e) => setEditingSchool({...editingSchool, display_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingSchool.email || ""}
                  onChange={(e) => setEditingSchool({...editingSchool, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editingSchool.phone || ""}
                  onChange={(e) => setEditingSchool({...editingSchool, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Max Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={editingSchool.max_capacity_per_slot || 10}
                  onChange={(e) => setEditingSchool({...editingSchool, max_capacity_per_slot: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="active"
                  checked={editingSchool.is_active}
                  onCheckedChange={(checked) => setEditingSchool({...editingSchool, is_active: checked})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSchool}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_name" className="text-right">
                Name *
              </Label>
              <Input
                id="new_name"
                value={newSchool.name}
                onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                className="col-span-3"
                placeholder="School name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_display_name" className="text-right">
                Display Name
              </Label>
              <Input
                id="new_display_name"
                value={newSchool.display_name}
                onChange={(e) => setNewSchool({...newSchool, display_name: e.target.value})}
                className="col-span-3"
                placeholder="Display name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_email" className="text-right">
                Email
              </Label>
              <Input
                id="new_email"
                type="email"
                value={newSchool.email}
                onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                className="col-span-3"
                placeholder="contact@school.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_phone" className="text-right">
                Phone
              </Label>
              <Input
                id="new_phone"
                value={newSchool.phone}
                onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                className="col-span-3"
                placeholder="Phone number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_capacity" className="text-right">
                Max Capacity
              </Label>
              <Input
                id="new_capacity"
                type="number"
                value={newSchool.max_capacity_per_slot}
                onChange={(e) => setNewSchool({...newSchool, max_capacity_per_slot: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_active" className="text-right">
                Active
              </Label>
              <Switch
                id="new_active"
                checked={newSchool.is_active}
                onCheckedChange={(checked) => setNewSchool({...newSchool, is_active: checked})}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSchool} disabled={addSchoolMutation.isPending}>
                {addSchoolMutation.isPending ? "Adding..." : "Add School"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schools;