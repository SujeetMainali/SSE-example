import { useEffect, useState, useCallback, useRef } from "react";
import type { INotification } from "./type";
import { getPriorityColor, getTypeIcon } from "./colorUtils";

export default function App() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");
  const [showNotificationAlert, setShowNotificationAlert] =
    useState<boolean>(false);
  const prevNotificationCount = useRef<number>(0);

  // Subscribe to SSE stream
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5002/events");

    eventSource.onopen = () => {
      setIsConnected(true);
      setConnectionStatus("Connected");
      console.log("✅ SSE connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: INotification = JSON.parse(event.data);
        setNotifications((prev) => {
          const newNotifications = [data, ...prev].slice(0, 50); // Keep only latest 50

          // Show notification alert for new notifications
          if (newNotifications.length > prevNotificationCount.current) {
            setShowNotificationAlert(true);
            setTimeout(() => setShowNotificationAlert(false), 3000);
          }

          return newNotifications;
        });
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setConnectionStatus("Connection lost. Reconnecting...");
      console.error("SSE connection lost. Reconnecting...");
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
      setConnectionStatus("Disconnected");
    };
  }, []);

  // Update previous notification count
  useEffect(() => {
    prevNotificationCount.current = notifications.length;
  }, [notifications.length]);

  // Trigger backend POST /notify
  const sendNotification = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5002/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }, []);

  const formatTimeAgo = (timeString: string): string => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Notification Alert */}
      {showNotificationAlert && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          🔔 New notification received!
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            🔔 Real-time Notifications
          </h1>
          <p className="text-gray-600">Stay connected with live updates</p>
        </div>

        {/* Connection Status & Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`font-medium ${
                  isConnected ? "text-green-700" : "text-red-700"
                }`}
              >
                {connectionStatus}
              </span>
              <span className="text-sm text-gray-500">
                {notifications.length} notifications
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendNotification}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
              >
                📬 Send Notification
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-md hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              📋 Live Notifications
            </h2>
          </div>

          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500">
                  Click "Send Notification" to receive your first notification
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map(
                  (notification: INotification, index: number) => (
                    <div
                      key={`${notification.id}-${index}`}
                      className={`border-l-4 rounded-r-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${getPriorityColor(
                        notification.priority
                      )} ${notification.read ? "opacity-70" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">
                              {getTypeIcon(notification.type)}
                            </span>
                            <h3 className="font-semibold text-gray-800 truncate">
                              {notification.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                notification.priority === "critical"
                                  ? "bg-red-200 text-red-800"
                                  : notification.priority === "high"
                                  ? "bg-orange-200 text-orange-800"
                                  : notification.priority === "medium"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-green-200 text-green-800"
                              }`}
                            >
                              {notification.priority.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-gray-700 mb-2 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              🏢 {notification.department}
                            </span>
                            <span className="flex items-center gap-1">
                              ⏰ {formatTimeAgo(notification.time)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {notification.read ? "✓ Read" : "Mark read"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Built with React, TypeScript, and Server-Sent Events</p>
        </div>
      </div>
    </div>
  );
}
