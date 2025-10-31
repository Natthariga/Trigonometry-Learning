import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Sidebar from "../components/navBar";
import Footer from "../components/footer";
import { getUserId } from "../js/auth";
import { getNotifications, markAllNotificationsRead } from "../api/students/notification";

const NotificationItem = ({ notification }) => (
  <div
    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${notification.status === "read"
      ? "bg-gray-100"
      : notification.status === "unread"
        ? "bg-blue-50 font-bold"
        : ""
      } hover:bg-blue-100`}
  >
    <div className="flex items-center gap-3">
      <Bell className="w-5 h-5 text-blue-500" />
      <span>{notification.message}</span>
    </div>
    <span className="text-xs text-gray-500">{notification.created_at}</span>
  </div>
);

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const userId = getUserId();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(userId);
      if (data.status === "success") {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const data = await markAllNotificationsRead(userId);
      if (data.status === "success") {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "read" }))
        );
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // polling ทุก 10 วิ
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 pt-32 w-full overflow-y-auto max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-700">การแจ้งเตือน</h1>
          <button
            onClick={markAllRead}
            className="text-sm text-blue-500 hover:underline"
          >
            ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.notification_id}
                notification={notif}
              />
            ))
          ) : (
            <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
          )}
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default NotificationPage;
