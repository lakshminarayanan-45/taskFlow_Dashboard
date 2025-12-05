import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task, TaskStatus } from "@/types/task";
import { format } from "date-fns";
import { useTaskContext } from "@/context/TaskContext";

interface TaskListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  title: string;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-status-in-progress text-status-in-progress-foreground" },
  review: { label: "Review", className: "bg-status-review text-status-review-foreground" },
  done: { label: "Done", className: "bg-status-done text-status-done-foreground" },
};

export function TaskListModal({ open, onOpenChange, tasks, title }: TaskListModalProps) {
  const { setSelectedTask } = useTaskContext();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title} ({tasks.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tasks found</p>
          ) : (
            tasks.map((task) => {
              const status = statusConfig[task.status];
              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
