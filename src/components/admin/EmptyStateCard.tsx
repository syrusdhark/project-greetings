import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  ArrowRight, 
  PlusCircle,
  MessageCircle,
  BarChart3,
  Settings
} from "lucide-react";

interface EmptyStateProps {
  type: 'no-bookings' | 'no-filtered-results' | 'no-history' | 'no-reports';
  title: string;
  description: string;
  suggestions?: Array<{
    icon: React.ComponentType<any>;
    label: string;
    action: () => void;
  }>;
}

const EmptyStateCard = ({ type, title, description, suggestions = [] }: EmptyStateProps) => {
  const getIllustrationIcon = () => {
    switch (type) {
      case 'no-bookings':
        return Calendar;
      case 'no-filtered-results':
        return FileText;
      case 'no-history':
        return BarChart3;
      case 'no-reports':
        return Settings;
      default:
        return Calendar;
    }
  };

  const IllustrationIcon = getIllustrationIcon();

  const getDefaultSuggestions = () => {
    switch (type) {
      case 'no-bookings':
        return [
          {
            icon: PlusCircle,
            label: "Share your booking link",
            action: () => window.open('/bookings', '_blank')
          },
          {
            icon: Calendar,
            label: "Check tomorrow's slots",
            action: () => console.log('Navigate to tomorrow')
          },
          {
            icon: MessageCircle,
            label: "Contact support",
            action: () => console.log('Open support')
          }
        ];
      case 'no-filtered-results':
        return [
          {
            icon: Settings,
            label: "Clear all filters",
            action: () => console.log('Clear filters')
          },
          {
            icon: Calendar,
            label: "Try different date range",
            action: () => console.log('Change date range')
          }
        ];
      default:
        return [];
    }
  };

  const actionSuggestions = suggestions.length > 0 ? suggestions : getDefaultSuggestions();

  return (
    <Card className="border-dashed border-2 border-slate-200">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {/* Illustration */}
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <IllustrationIcon className="h-10 w-10 text-slate-400" />
        </div>

        {/* Content */}
        <div className="max-w-md space-y-3 mb-8">
          <h3 className="text-lg font-semibold text-slate-900">
            {title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Suggestions */}
        {actionSuggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 mb-4">
              Here's what you can do:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {actionSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={suggestion.action}
                  className="flex items-center space-x-2 justify-center"
                >
                  <suggestion.icon className="h-4 w-4" />
                  <span>{suggestion.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-slate-200 w-full">
          <p className="text-xs text-slate-500">
            Need help getting started? 
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs ml-1"
              onClick={() => console.log('Open help')}
            >
              Visit our help center
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;