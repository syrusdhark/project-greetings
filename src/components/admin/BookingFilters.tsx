import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Download, Search, BookmarkPlus, X } from "lucide-react";

interface QuickFilter {
  id: string;
  label: string;
  count?: number;
  isActive?: boolean;
}

interface SavedView {
  id: string;
  name: string;
  filters: any;
}

interface BookingFiltersProps {
  onFilterChange: (filters: any) => void;
  quickFilters: QuickFilter[];
  onQuickFilterToggle: (filterId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  savedViews: SavedView[];
  onSavedViewSelect: (viewId: string) => void;
  onSaveCurrentView: () => void;
  onExportBookings: () => void;
  onClearFilters: () => void;
}

const BookingFilters = ({
  onFilterChange,
  quickFilters,
  onQuickFilterToggle,
  searchTerm,
  onSearchChange,
  savedViews,
  onSavedViewSelect,
  onSaveCurrentView,
  onExportBookings,
  onClearFilters,
}: BookingFiltersProps) => {
  const activeFiltersCount = quickFilters.filter(f => f.isActive).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="booking-search"
                placeholder="Search by customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select onValueChange={onSavedViewSelect}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Saved Views" />
              </SelectTrigger>
              <SelectContent>
                {savedViews.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={onSaveCurrentView}>
              <BookmarkPlus className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Save View</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={onExportBookings}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Quick Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={filter.isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onQuickFilterToggle(filter.id)}
                className="flex items-center gap-2"
              >
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <Badge 
                    variant={filter.isActive ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {filter.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range and Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select onValueChange={(value) => onFilterChange({ dateRange: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => onFilterChange({ paymentStatus: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => onFilterChange({ timeSlot: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Time Slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Slots</SelectItem>
              <SelectItem value="6:00 AM - 7:00 AM">6:00 AM - 7:00 AM</SelectItem>
              <SelectItem value="7:00 AM - 8:00 AM">7:00 AM - 8:00 AM</SelectItem>
              <SelectItem value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</SelectItem>
              <SelectItem value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFilters;