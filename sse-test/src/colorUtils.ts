import {
  type NotificationPriority,
  type NotificationType,
} from "../../backend/types";

export const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case "critical":
      return "bg-red-100 border-red-500 text-red-800";
    case "high":
      return "bg-orange-100 border-orange-500 text-orange-800";
    case "medium":
      return "bg-yellow-100 border-yellow-500 text-yellow-800";
    case "low":
      return "bg-green-100 border-green-500 text-green-800";
    default:
      return "bg-gray-100 border-gray-500 text-gray-800";
  }
};

export const getTypeIcon = (type: NotificationType): string => {
  switch (type) {
    case "alert":
      return "🚨";
    case "warning":
      return "⚠️";
    case "information":
      return "ℹ️";
    case "notice":
      return "📢";
    default:
      return "🔔";
  }
};
