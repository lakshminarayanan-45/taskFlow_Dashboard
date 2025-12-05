import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, AlertCircle, ListTodo, LayoutGrid, List } from "lucide-react";
import { TaskListModal } from "@/components/dashboard/TaskListModal";
import { Task, TaskStatus } from "@/types/task";
import { format } from "date-fns";

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-status-in-progress text-status-in-progress-foreground" },
  review: { label: "Review", className: "bg-status-review text-status-review-foreground" },
  done: { label: "Done", className: "bg-status-done text-status-done-foreground" },
};

export default function Dashboard() {
  const { tasks, setSelectedTask, notifications } = useTaskContext();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTasks, setModalTasks] = useState<Task[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  const openTaskModal = (filteredTasks: Task[], title: string) => {
    setModalTasks(filteredTasks);
    setModalTitle(title);
    setModalOpen(true);
  };

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary/10",
      tasks: tasks,
    },
    {
      title: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      icon: Clock,
      color: "text-status-in-progress",
      bg: "bg-status-in-progress/10",
      tasks: tasks.filter((t) => t.status === "in-progress"),
    },
    {
      title: "In Review",
      value: tasks.filter((t) => t.status === "review").length,
      icon: AlertCircle,
      color: "text-status-review",
      bg: "bg-status-review/10",
      tasks: tasks.filter((t) => t.status === "review"),
    },
    {
      title: "Completed",
      value: tasks.filter((t) => t.status === "done").length,
      icon: CheckCircle,
      color: "text-status-done",
      bg: "bg-status-done/10",
      tasks: tasks.filter((t) => t.status === "done"),
    },
  ];

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your tasks and progress</p>
        </div>
        <div className="flex items-center gap-2 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" 
        : "flex flex-col gap-3"
      }>
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openTaskModal(stat.tasks, stat.title)}
          >
            <CardHeader className={viewMode === "grid" 
              ? "flex flex-row items-center justify-between pb-2" 
              : "flex flex-row items-center gap-4 pb-2"
            }>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={viewMode === "grid" ? "text-right" : "flex-1 flex justify-between items-center"}>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <p className={viewMode === "grid" ? "text-3xl font-bold mt-1" : "text-2xl font-bold"}>
                  {stat.value}
                </p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => {
                const status = statusConfig[task.status];
                return (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigned to {task.assignee.name}
                      </p>
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent updates</p>
              ) : (
                recentNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List Modal */}
      <TaskListModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        tasks={modalTasks} 
        title={modalTitle} 
      />
    </div>
  );
}
