import http from "../http";

// ✅ ดึงการแจ้งเตือนทั้งหมด
export const getNotifications = async (userId) => {
  const { data } = await http.get("/students/get_notifications.php", {
    params: { user_id: userId, action: "get" },
  });
  return data;
};

// ✅ มาร์กว่าอ่านแล้วทั้งหมด
export const markAllNotificationsRead = async (userId) => {
  const { data } = await http.get("/students/get_notifications.php", {
    params: { user_id: userId, action: "mark_read" },
  });
  return data;
};
