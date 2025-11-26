import http from "../http";

export async function getStudentClassroom(userId) {
  try {
    const res = await http.post("/students/get_student_classroom.php", {
      user_id: userId
    }, { withCredentials: true });

    if (res.data.status === "success" && res.data.classroom) {
      return { success: true, classroom: res.data.classroom };
    }
    return { success: false, message: res.data.message || "ยังไม่ได้เข้าห้องเรียน" };
  } catch (err) {
    console.error("Error fetching classroom:", err);
    return { success: false, message: "โหลดข้อมูลห้องเรียนไม่สำเร็จ" };
  }
}