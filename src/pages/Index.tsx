import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight, Users, BarChart3, Bell } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Task Manager</span>
        </div>
        <Link to="/login">
          <Button>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Manage Your Team's Tasks
            <span className="text-primary"> Efficiently</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A powerful task management system with role-based access, Kanban boards, and real-time notifications.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/login">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Admin, Manager, and Employee roles with different permissions.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Kanban Boards</h3>
            <p className="text-sm text-muted-foreground">
              Visualize and organize tasks with drag-and-drop Kanban boards.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Stay updated with real-time task notifications and alerts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
