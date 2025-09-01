import { INotification } from "./types";

export const mockNotifications: INotification[] = [
  {
    id: 1,
    title: "Emergency Weather Alert",
    message:
      "Severe thunderstorm warning in effect for downtown area. Seek shelter immediately.",
    time: "5 min ago",
    type: "alert",
    priority: "critical",
    read: false,
    department: "National Weather Service",
  },
  {
    id: 2,
    title: "Traffic Advisory",
    message:
      "Highway 101 southbound lanes closed due to construction. Use alternate routes.",
    time: "1 hour ago",
    type: "information",
    priority: "medium",
    read: false,
    department: "Department of Transportation",
  },
  {
    id: 3,
    title: "Public Health Notice",
    message:
      "Free vaccination clinic available at City Hall from 9 AM to 5 PM this week.",
    time: "2 hours ago",
    type: "notice",
    priority: "low",
    read: true,
    department: "Health Department",
  },
  {
    id: 4,
    title: "Air Quality Warning",
    message:
      "Poor air quality detected. Sensitive individuals should limit outdoor activities.",
    time: "3 hours ago",
    type: "warning",
    priority: "high",
    read: false,
    department: "Environmental Protection",
  },
];
