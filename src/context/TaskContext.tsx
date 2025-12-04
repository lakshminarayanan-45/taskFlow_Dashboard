import React, { createContext, useContext, useState, ReactNode } from "react";
import { Task, Notification, User, TaskStatus, TaskPriority } from "@/types/task";
import { tasks as initialTasks, notifications as initialNotifications, users } from "@/data/mockData";

interface NewTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User;
  dueDate: string;
  tags: string[];
}

interface TaskContextType {
  tasks: Task[];
  notifications: Notification[];
  currentUser: User;
  selectedTask: Task | null;
  setCurrentUser: (user: User) => void;
  setSelectedTask: (task: Task | null) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (taskData: NewTaskData) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  canEditTask: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
  canCreateTask: () => boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const addTask = (taskData: NewTaskData) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      comments: [],
      attachments: [],
    };
    setTasks((prev) => [newTask, ...prev]);

    // Add notification for assignee
    if (taskData.assignee.id !== currentUser.id) {
      addNotification({
        title: "New task assigned",
        message: `${currentUser.name} assigned you "${taskData.title}"`,
        type: "task",
        read: false,
        taskId: newTask.id,
      });
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Permission logic based on roles
  const canEditTask = (task: Task): boolean => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager") return true;
    if (currentUser.role === "employee") {
      return task.assignee.id === currentUser.id;
    }
    return false;
  };

  const canDeleteTask = (task: Task): boolean => {
    if (currentUser.role === "admin") return true;
    return false;
  };

  const canCreateTask = (): boolean => {
    return currentUser.role === "admin";
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        notifications,
        currentUser,
        selectedTask,
        setCurrentUser,
        setSelectedTask,
        updateTask,
        deleteTask,
        moveTask,
        addTask,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        canEditTask,
        canDeleteTask,
        canCreateTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
