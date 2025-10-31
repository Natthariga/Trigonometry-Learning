import http from "./http";

// ดึงข้อมูลผู้ใช้
export const getUserProfile = async (id) => {
  const { data } = await http.get("/profile/get_user.php", {
    params: { id },
  });
  return data;
};

export const updateUserPassword = async (userId, newPassword) => {
  try {
    const { data } = await http.post("/profile/update_password.php", {
      user_id: userId,
      password: newPassword,
    });

    return data;
  } catch (err) {
    console.error("UpdateUserPassword error:", err);
    return { status: "error", message: "ไม่สามารถเปลี่ยนรหัสผ่านได้" };
  }
};

// อัปเดตข้อมูลโปรไฟล์
export const updateUserProfile = async (form) => {
  const { data } = await http.post("/profile/edit_profile.php", form);
  return data;
};

// อัปโหลดรูปโปรไฟล์
export const uploadProfileImage = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("profile_image", file);
    formData.append("user_id", userId);

    const { data } = await http.post("/profile/upload_profile.php", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // data = { status: "success", image_url: "..." } 
    return data;
  } catch (err) {
    console.error("UploadProfileImage error:", err);
    return { status: "error", message: "ไม่สามารถอัปโหลดรูปได้" };
  }
};

// teacher
// ✅ ดึงข้อมูลผู้ใช้
export const getUser = async (id) => {
  const { data } = await http.get(`/profile/get_user.php?id=${id}`);
  return data;
};

// ✅ อัปเดตโปรไฟล์
export const editProfile = async (form) => {
  const { data } = await http.post("/profile/edit_profile.php", form, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
};
