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
  const { tasks, canCreateTask } = useTaskContext();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && task.assignee.id !== assigneeFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your team's tasks</p>
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
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onAssigneeChange={setAssigneeFilter}
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
