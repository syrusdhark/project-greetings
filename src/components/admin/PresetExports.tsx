import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download,
  Calendar,
  FileSpreadsheet,
  Filter,
  Clock
} from "lucide-react";

interface PresetExportProps {
  onExport: (preset: string, format: 'csv' | 'xlsx') => void;
  isLoading?: boolean;
}

const PresetExports = ({ onExport, isLoading = false }: PresetExportProps) => {
  const presets = [
    {
      id: 'today-all',
      name: "Today's All Bookings",
      description: "Complete list of today's bookings",
      icon: Calendar,
      popular: true,
    },
    {
      id: 'today-unpaid',
      name: "Today's Unpaid",
      description: "Bookings with pending payments",
      icon: Filter,
      popular: true,
    },
    {
      id: 'end-of-day',
      name: "End-of-Day Report",
      description: "Summary for daily closure",
      icon: Clock,
      popular: true,
    },
    {
      id: 'weekly-summary',
      name: "Weekly Summary",
      description: "Last 7 days booking report",
      icon: FileSpreadsheet,
      popular: false,
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              Quick Export Presets
            </h3>
            <p className="text-xs text-slate-600">
              Common reports ready to download
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <div 
                key={preset.id}
                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <preset.icon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-900">
                      {preset.name}
                    </span>
                    {preset.popular && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 mb-3">
                  {preset.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExport(preset.id, 'csv')}
                    disabled={isLoading}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExport(preset.id, 'xlsx')}
                    disabled={isLoading}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Custom date ranges and filters available in the main Reports section
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresetExports;