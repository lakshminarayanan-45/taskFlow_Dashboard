import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { TaskPriority, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Tasks() {
  const { tasks, canCreateTask, currentUser } = useTaskContext();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  // For employees, only show their own tasks
  const baseTasks = currentUser.role === "employee" 
    ? tasks.filter((task) => task.assignee.id === currentUser.id)
    : tasks;

  const filteredTasks = baseTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && task.assignee.id !== assigneeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description.toLowerCase().includes(query);
      const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(query));
      const matchesAssignee = task.assignee.name.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesTags && !matchesAssignee) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            {currentUser.role === "employee" ? "Your assigned tasks" : "Manage and track your team's tasks"}
          </p>
        </div>
        {canCreateTask() && (
          <Button onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <TaskFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        assigneeFilter={assigneeFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onAssigneeChange={setAssigneeFilter}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
      />

      {/* Kanban Board */}
      <KanbanBoard filteredTasks={filteredTasks} />

      {/* Task Detail Modal */}
      <TaskDetailModal />

      {/* New Task Modal */}
      <NewTaskModal open={newTaskOpen} onOpenChange={setNewTaskOpen} />
    </div>
  );
}