import http from "./http";

export const loginApi = async (username, password) => {
  try {
    const res = await http.post("/login.php", { username, password }, { withCredentials: true });
    let data = res.data;

    if (typeof data === "string" && data.includes("{")) {
      try {
        data = JSON.parse(data.substring(data.indexOf("{")));
      } catch (e) {
        return { status: "error", message: "ข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง" };
      }
    }

    if (data.status === "success") {
      return {
        status: "success",
        user: {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          username: data.username,
          picture_profile: data.picture_profile,
          classroom: data.classroom
        },
        message: data.message
      };
    } else {
      return { status: "error", message: data.message };
    }
  } catch (err) {
    console.error("Login API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


// register
export const registerStudentApi = async (userData) => {
  try {
    const { data } = await http.post("/register_student.php", userData, {
      withCredentials: true,
    });
    // console.log("Register API response:", data);
    return data;
  } catch (err) {
    console.error("Register API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};
