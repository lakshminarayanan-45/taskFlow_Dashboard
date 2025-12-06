import React, { createContext, useContext, useState, useEffect } from "react";
import { tasks as initialTasks, notifications as initialNotifications, users } from "@/data/mockData.js";

const TaskContext = createContext(undefined);

// Storage keys
const STORAGE_KEYS = {
  TASKS: "taskmanager_tasks",
  NOTIFICATIONS: "taskmanager_notifications",
  CURRENT_ROUTE: "taskmanager_current_route",
};

// Load from localStorage or return default
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading from storage:", e);
  }
  return defaultValue;
}

// Save to localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to storage:", e);
  }
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.TASKS, initialTasks));
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications));
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(users[0]);

  // Persist tasks to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  // Persist notifications to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  const updateTask = (taskId, updates) => {
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

  const deleteTask = (taskId) => {
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

  const moveTask = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const addTask = (taskData) => {
    const newTask = {
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

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Comment functions
  const addComment = (taskId, content) => {
    const newComment = {
      id: `c-${Date.now()}`,
      user: currentUser,
      content,
      createdAt: new Date().toISOString(),
      editedAt: null,
    };
    
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, newComment] }
          : t
      )
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }

    // Notify about new comment
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addNotification({
        title: "New Comment",
        message: `${currentUser.name} commented on "${task.title}"`,
        type: "comment",
        read: false,
        taskId: taskId,
      });
    }
  };

  const editComment = (taskId, commentId, newContent) => {
    const updateComments = (comments) =>
      comments.map((c) =>
        c.id === commentId
          ? { ...c, content: newContent, editedAt: new Date().toISOString() }
          : c
      );

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: updateComments(t.comments) }
          : t
      )
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev ? { ...prev, comments: updateComments(prev.comments) } : null
      );
    }
  };

  const deleteComment = (taskId, commentId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
          : t
      )
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev
          ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }
          : null
      );
    }
  };

  // Permission logic based on roles
  const canEditTask = (task) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager") return true;
    if (currentUser.role === "employee") {
      return task.assignee.id === currentUser.id;
    }
    return false;
  };

  const canDeleteTask = (task) => {
    if (currentUser.role === "admin") return true;
    return false;
  };

  const canCreateTask = () => {
    return currentUser.role === "admin";
  };

  const canEditComment = (comment) => {
    return currentUser.role === "admin" || comment.user.id === currentUser.id;
  };

  const canDeleteComment = (comment) => {
    return currentUser.role === "admin" || comment.user.id === currentUser.id;
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
        addComment,
        editComment,
        deleteComment,
        canEditTask,
        canDeleteTask,
        canCreateTask,
        canEditComment,
        canDeleteComment,
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