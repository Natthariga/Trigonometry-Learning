import http from "../http";

export const getStudentListApi = async () => {
  try {
    const response = await http.get("/teachers/get_student_list.php");
    return response.data;
  } catch (err) {
    console.error("Get Student List API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


// ฟังก์ชันบันทึกรายชื่อนักเรียนลง server
export const saveStudentListApi = async (data) => {
  try {
    const response = await http.post("/teachers/save_student_list.php", { data });
    return response.data; // คืนค่าผลลัพธ์จาก server
  } catch (err) {
    console.error("Save Student List API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


export const addStudentApi = async (studentData) => {
  try {
    const response = await http.post("/teachers/add_student.php", studentData);
    return response.data;
  } catch (err) {
    console.error("Add Student API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


export const deleteStudentApi = async (studentId) => {
  try {
    const response = await http.post("/teachers/delete_student.php", { studentId });
    return response.data;
  } catch (err) {
    console.error("Delete Student API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};
