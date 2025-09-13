import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, HelpCircle } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onDismiss: () => void;
  completedCount: number;
  totalCount: number;
}

const OnboardingChecklist = ({ 
  steps, 
  onDismiss, 
  completedCount, 
  totalCount 
}: OnboardingChecklistProps) => {
  const completionPercentage = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  if (isComplete) {
    return null; // Hide when all steps are complete
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">
                Welcome to Pelagos!
              </CardTitle>
              <p className="text-sm text-blue-700">
                Complete your setup to get the most out of your dashboard
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="text-blue-600 hover:text-blue-800"
          >
            Dismiss
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700 font-medium">
              Setup Progress
            </span>
            <span className="text-blue-600">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2 bg-blue-100" 
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                step.completed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${
                  step.completed ? 'text-green-800' : 'text-slate-900'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs mt-1 ${
                  step.completed ? 'text-green-600' : 'text-slate-600'
                }`}>
                  {step.description}
                </p>
              </div>

              {!step.completed && step.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={step.action.onClick}
                  className="flex items-center space-x-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <span>{step.action.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completedCount > 0 && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              Great progress! {completedCount === totalCount ? 
                "You're all set up and ready to manage your bookings effectively." :
                `${totalCount - completedCount} more step${totalCount - completedCount !== 1 ? 's' : ''} to complete your setup.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;