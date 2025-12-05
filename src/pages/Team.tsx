import { useState } from "react";
import { users } from "@/data/mockData";
import { useTaskContext } from "@/context/TaskContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle } from "lucide-react";
import { TaskListModal } from "@/components/dashboard/TaskListModal";
import { Task, User } from "@/types/task";

export default function Team() {
  const { tasks } = useTaskContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTasks, setModalTasks] = useState<Task[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  const handleUserClick = (user: User) => {
    const userTasks = tasks.filter((t) => t.assignee.id === user.id);
    setModalTasks(userTasks);
    setModalTitle(`${user.name}'s Tasks`);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-muted-foreground">View and manage team members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.map((user) => {
          const userTasks = tasks.filter((t) => t.assignee.id === user.id);
          const completedTasks = userTasks.filter((t) => t.status === "done").length;

          return (
            <Card 
              key={user.id} 
              className="hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1"
              onClick={() => handleUserClick(user)}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {user.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border w-full justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{userTasks.length}</p>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-status-done flex items-center gap-1 justify-center">
                        <CheckCircle className="h-4 w-4" />
                        {completedTasks}
                      </p>
                      <p className="text-xs text-muted-foreground">Done</p>
                    </div>
                  </div>
                  <p className="text-xs text-primary mt-3">Click to view tasks →</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
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