import http from "../http";

// ดึงรายชื่อผู้ใช้ทั้งหมด (นักเรียน + ครู)
export const getUsers = async () => {
    const { data } = await http.get("/teachers/member/get_user.php");
    return data;
};

// ลบผู้ใช้
export const deleteUser = async (userId) => {
  const formData = new FormData();
  formData.append("user_id", userId);

  const { data } = await http.put("/teachers/member/delete_user.php", formData);
  return data;
};


// สมัครสมาชิก (เพิ่ม user ใหม่จาก admin)
export const registerUser = async (form) => {
    const { data } = await http.post("/register_admin.php", form, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};