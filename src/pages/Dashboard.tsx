import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, AlertCircle, ListTodo, LayoutGrid, List, Search } from "lucide-react";
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
  const { tasks, setSelectedTask, notifications, currentUser } = useTaskContext();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTasks, setModalTasks] = useState<Task[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // For employees, only show their own tasks
  const baseTasks = currentUser.role === "employee" 
    ? tasks.filter((task) => task.assignee.id === currentUser.id)
    : tasks;

  // Filter tasks by search query
  const filteredTasks = baseTasks.filter((task) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.assignee.name.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const openTaskModal = (taskList: Task[], title: string) => {
    // Apply search filter to modal tasks too
    const filtered = taskList.filter((task) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignee.name.toLowerCase().includes(query)
      );
    });
    setModalTasks(filtered);
    setModalTitle(title);
    setModalOpen(true);
  };

  const stats = [
    {
      title: "Total Tasks",
      value: filteredTasks.length,
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "border-primary/20",
      tasks: filteredTasks,
    },
    {
      title: "In Progress",
      value: filteredTasks.filter((t) => t.status === "in-progress").length,
      icon: Clock,
      color: "text-status-in-progress",
      bg: "bg-status-in-progress/10",
      borderColor: "border-status-in-progress/20",
      tasks: filteredTasks.filter((t) => t.status === "in-progress"),
    },
    {
      title: "In Review",
      value: filteredTasks.filter((t) => t.status === "review").length,
      icon: AlertCircle,
      color: "text-status-review",
      bg: "bg-status-review/10",
      borderColor: "border-status-review/20",
      tasks: filteredTasks.filter((t) => t.status === "review"),
    },
    {
      title: "Completed",
      value: filteredTasks.filter((t) => t.status === "done").length,
      icon: CheckCircle,
      color: "text-status-done",
      bg: "bg-status-done/10",
      borderColor: "border-status-done/20",
      tasks: filteredTasks.filter((t) => t.status === "done"),
    },
  ];

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentUser.role === "employee" ? "Your task overview" : "Overview of your tasks and progress"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Beautiful Overview */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
        : "flex flex-col gap-4"
      }>
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${stat.borderColor} ${stat.bg}`}
            onClick={() => openTaskModal(stat.tasks, stat.title)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {viewMode === "grid" ? (
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ring-2 ring-inset ring-current/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <p className={`text-4xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    View all →
                  </span>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                </div>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks.slice(0, 5).map((task) => {
                const status = statusConfig[task.status];
                return (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-all duration-200 hover:shadow-sm"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-background">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigned to {task.assignee.name}
                      </p>
                    </div>
                    <Badge className={`${status.className} shrink-0`}>{status.label}</Badge>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No tasks found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent updates</p>
              ) : (
                recentNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-200"
                  >
                    <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${notification.read ? 'bg-muted-foreground/50' : 'bg-primary animate-pulse'}`} />
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