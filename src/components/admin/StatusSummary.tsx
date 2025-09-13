import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface StatusSummaryProps {
  totalBookings: number;
  newBookings: number;
  unpaidBookings: number;
  totalParticipants: number;
  capacityUsed: number;
  totalCapacity: number;
  totalRevenue: number;
  pendingFollowups: number;
  overduePayments: number;
  yesterdayBookings?: number;
  timezone: string;
}

const StatusSummary = ({
  totalBookings,
  newBookings,
  unpaidBookings,
  totalParticipants,
  capacityUsed,
  totalCapacity,
  totalRevenue,
  pendingFollowups,
  overduePayments,
  yesterdayBookings = 0,
  timezone
}: StatusSummaryProps) => {
  const capacityPercentage = totalCapacity > 0 ? (capacityUsed / totalCapacity) * 100 : 0;
  const bookingsTrend = yesterdayBookings > 0 ? ((totalBookings - yesterdayBookings) / yesterdayBookings) * 100 : 0;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return TrendingUp;
    if (trend < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-slate-500";
  };

  const summaryCards = [
    {
      title: "Today's Bookings",
      value: totalBookings,
      subtitle: `${newBookings} new`,
      icon: Calendar,
      color: "text-blue-600",
      trend: bookingsTrend,
      hasAlert: newBookings > 0,
    },
    {
      title: "Revenue Today",
      value: `₹${totalRevenue.toLocaleString()}`,
      subtitle: `${unpaidBookings} unpaid`,
      icon: DollarSign,
      color: "text-green-600",
      hasAlert: unpaidBookings > 0,
    },
    {
      title: "Participants",
      value: totalParticipants,
      subtitle: "Total today",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Capacity Used",
      value: `${Math.round(capacityPercentage)}%`,
      subtitle: `${capacityUsed}/${totalCapacity} slots`,
      icon: Clock,
      color: capacityPercentage >= 90 ? "text-red-600" : capacityPercentage >= 70 ? "text-orange-600" : "text-green-600",
      hasAlert: capacityPercentage >= 90,
    },
  ];

  const attentionItems = [
    ...(newBookings > 0 ? [{ label: "New bookings need attention", count: newBookings, type: "new" as const }] : []),
    ...(unpaidBookings > 0 ? [{ label: "Unpaid bookings", count: unpaidBookings, type: "payment" as const }] : []),
    ...(overduePayments > 0 ? [{ label: "Overdue payments", count: overduePayments, type: "overdue" as const }] : []),
    ...(pendingFollowups > 0 ? [{ label: "Pending follow-ups", count: pendingFollowups, type: "followup" as const }] : []),
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Main Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const TrendIcon = getTrendIcon(card.trend || 0);
          const trendColor = getTrendColor(card.trend || 0);
          
          return (
            <Card key={card.title} className={`relative ${card.hasAlert ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {card.hasAlert && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-slate-600 mt-1">
                      {card.subtitle}
                    </p>
                  </div>
                  {card.trend !== undefined && (
                    <div className={`flex items-center text-xs ${trendColor}`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {Math.abs(card.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                
                {card.title === "Capacity Used" && (
                  <div className="mt-3">
                    <Progress 
                      value={capacityPercentage} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attention Items */}
      {attentionItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-sm font-medium text-orange-800">
                Items Requiring Attention
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {attentionItems.map((item, index) => (
                <Badge 
                  key={index}
                  variant={item.type === 'overdue' ? 'destructive' : item.type === 'new' ? 'default' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  <span>{item.count}</span>
                  <span>{item.label}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timezone Indicator */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          All times displayed in {timezone} • Last updated: {new Date().toLocaleString('en-IN', { 
            timeZone: timezone === 'Asia/Kolkata' ? 'Asia/Kolkata' : timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default StatusSummary;