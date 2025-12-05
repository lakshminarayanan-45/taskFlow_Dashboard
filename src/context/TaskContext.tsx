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
    const task = tasks.find(t => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
    // Notify all users about the update
    if (task) {
      addNotification({
        title: "Task Updated",
        message: `"${task.title}" was updated by ${currentUser.name}`,
        type: "task",
        read: false,
        taskId: taskId,
      });
    }
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    // Notify all users about the deletion
    if (task) {
      addNotification({
        title: "Task Deleted",
        message: `"${task.title}" was deleted by ${currentUser.name}`,
        type: "task",
        read: false,
      });
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

    // Notify all users about the new task
    addNotification({
      title: "New Task Created",
      message: `"${taskData.title}" was created by ${currentUser.name}`,
      type: "task",
      read: false,
      taskId: newTask.id,
    });
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
