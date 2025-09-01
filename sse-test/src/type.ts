export type NotificationType = "alert" | "information" | "notice" | "warning";
export type NotificationPriority = "critical" | "high" | "medium" | "low";

export interface INotification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  department: string;
}
