import { TaskPriority, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { users } from "@/data/mockData";
import { Filter, X, Search } from "lucide-react";

interface TaskFiltersProps {
  statusFilter: TaskStatus | "all";
  priorityFilter: TaskPriority | "all";
  assigneeFilter: string | "all";
  searchQuery: string;
  onStatusChange: (value: TaskStatus | "all") => void;
  onPriorityChange: (value: TaskPriority | "all") => void;
  onAssigneeChange: (value: string | "all") => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  statusFilter,
  priorityFilter,
  assigneeFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSearchChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasFilters = statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || searchQuery !== "";

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as TaskStatus | "all")}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => onPriorityChange(v as TaskPriority | "all")}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 px-2">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}