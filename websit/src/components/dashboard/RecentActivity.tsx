'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'appointment' | 'message' | 'record';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

const activityIcons = {
  appointment: Calendar,
  message: MessageSquare,
  record: FileText,
};

const activityColors = {
  appointment: 'text-blue-600 bg-blue-100',
  message: 'text-green-600 bg-green-100',
  record: 'text-purple-600 bg-purple-100',
};

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  cancelled: AlertCircle,
};

const statusColors = {
  completed: 'text-green-600',
  pending: 'text-yellow-600',
  cancelled: 'text-red-600',
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className,
}) => {
  if (activities.length === 0) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            النشاط الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد نشاط حديث</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          النشاط الأخير
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const ActivityIcon = activityIcons[activity.type];
            const StatusIcon = statusIcons[activity.status];
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className={cn(
                  'p-2 rounded-full',
                  activityColors[activity.type]
                )}>
                  <ActivityIcon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <StatusIcon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      statusColors[activity.status]
                    )} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            عرض جميع الأنشطة
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
