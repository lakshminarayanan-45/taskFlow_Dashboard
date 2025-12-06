import { MessageSquare, Clock, AtSign, CheckCircle } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext.jsx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  task: CheckCircle,
  comment: MessageSquare,
  mention: AtSign,
  deadline: Clock,
};

export function NotificationList() {
  const { notifications, markNotificationRead, markAllNotificationsRead, setSelectedTask, tasks } = useTaskContext();

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    if (notification.taskId) {
      const task = tasks.find((t) => t.id === notification.taskId);
      if (task) setSelectedTask(task);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-auto">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllNotificationsRead}
          className="text-xs text-primary"
        >
          Mark all read
        </Button>
      </div>
      <ul>
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type];
          return (
            <li
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "p-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                !notification.read && "bg-primary/5"
              )}
            >
              <div className="flex gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  notification.type === "deadline" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !notification.read && "font-medium")}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}